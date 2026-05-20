from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.models import User, Interview, Message, Evaluation, Resume, InterviewStatus, MessageRole
from app.schemas.schemas import (
    InterviewCreate, InterviewOut, MessageOut,
    AnswerSubmit, NextQuestionResponse, ReportOut, EvaluationOut
)
from app.middleware.auth import get_current_user
from app.services.gemini import (
    generate_opening_question,
    generate_followup_question,
    evaluate_answer,
)
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/interviews", tags=["interviews"])


# ─── Create ───────────────────────────────────────────────────────────────────

@router.post("/", response_model=InterviewOut, status_code=status.HTTP_201_CREATED)
async def create_interview(
    body: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    interview = Interview(
        user_id=current_user.id,
        job_role=body.job_role,
        difficulty=body.difficulty,
        resume_id=body.resume_id,
        status=InterviewStatus.pending,
    )
    db.add(interview)
    await db.flush()
    await db.refresh(interview)
    return interview


# ─── Start ───────────────────────────────────────────────────────────────────

@router.post("/{interview_id}/start", response_model=MessageOut)
async def start_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    interview = await _get_interview(interview_id, current_user, db)

    if interview.status != InterviewStatus.pending:
        raise HTTPException(status_code=400, detail="Interview already started or completed.")

    # Load resume text if available
    resume_text = None
    if interview.resume_id:
        result = await db.execute(select(Resume).where(Resume.id == interview.resume_id))
        resume = result.scalar_one_or_none()
        if resume:
            resume_text = resume.parsed_text

    question_text = await generate_opening_question(
        job_role=interview.job_role,
        difficulty=interview.difficulty.value,
        resume_text=resume_text,
    )

    interview.status = InterviewStatus.active
    interview.started_at = datetime.utcnow()

    msg = Message(
        interview_id=interview.id,
        role=MessageRole.assistant,
        content=question_text,
        question_index=0,
    )
    db.add(msg)
    await db.flush()
    await db.refresh(msg)
    return msg


# ─── Submit answer ────────────────────────────────────────────────────────────

@router.post("/{interview_id}/answer", response_model=NextQuestionResponse)
async def submit_answer(
    interview_id: str,
    body: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    interview = await _get_interview(interview_id, current_user, db)

    if interview.status != InterviewStatus.active:
        raise HTTPException(status_code=400, detail="Interview is not active.")

    # Load messages
    result = await db.execute(
        select(Message)
        .where(Message.interview_id == interview.id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()

    # Find the last AI question
    last_question = next(
        (m for m in reversed(messages) if m.role == MessageRole.assistant), None
    )
    if not last_question:
        raise HTTPException(status_code=400, detail="No question found to answer.")

    # Save user answer
    answer_msg = Message(
        interview_id=interview.id,
        role=MessageRole.user,
        content=body.answer,
        question_index=last_question.question_index,
    )
    db.add(answer_msg)
    await db.flush()

    # Evaluate answer in background (async, non-blocking)
    eval_data = await evaluate_answer(
        job_role=interview.job_role,
        difficulty=interview.difficulty.value,
        question=last_question.content,
        answer=body.answer,
    )
    evaluation = Evaluation(
        interview_id=interview.id,
        message_id=answer_msg.id,
        question=last_question.content,
        answer=body.answer,
        **eval_data,
    )
    db.add(evaluation)

    # Determine next step
    current_q_index = last_question.question_index or 0
    next_q_index = current_q_index + 1
    total = settings.MAX_QUESTIONS_PER_INTERVIEW

    if next_q_index >= total:
        # Complete interview
        await _complete_interview(interview, db)
        dummy_msg = Message(
            interview_id=interview.id,
            role=MessageRole.assistant,
            content="Thank you for completing the interview! Your report is ready.",
            question_index=next_q_index,
        )
        db.add(dummy_msg)
        await db.flush()
        await db.refresh(dummy_msg)
        return NextQuestionResponse(
            message=MessageOut.model_validate(dummy_msg),
            is_complete=True,
            question_number=next_q_index,
            total_questions=total,
        )

    # Generate next question
    history = [{"role": m.role.value, "content": m.content} for m in messages]
    history.append({"role": "user", "content": body.answer})

    next_question = await generate_followup_question(
        job_role=interview.job_role,
        difficulty=interview.difficulty.value,
        conversation_history=history,
        question_index=next_q_index,
        total_questions=total,
    )

    next_msg = Message(
        interview_id=interview.id,
        role=MessageRole.assistant,
        content=next_question,
        question_index=next_q_index,
    )
    db.add(next_msg)
    await db.flush()
    await db.refresh(next_msg)

    return NextQuestionResponse(
        message=MessageOut.model_validate(next_msg),
        is_complete=False,
        question_number=next_q_index + 1,
        total_questions=total,
    )


# ─── List ─────────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[InterviewOut])
async def list_interviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Interview)
        .where(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


# ─── Report ───────────────────────────────────────────────────────────────────

@router.get("/{interview_id}/report", response_model=ReportOut)
async def get_report(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Interview)
        .options(selectinload(Interview.messages), selectinload(Interview.evaluations))
        .where(Interview.id == interview_id, Interview.user_id == current_user.id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    evals = interview.evaluations
    avg = lambda vals: round(sum(vals) / len(vals), 1) if vals else None

    scores = [e.score for e in evals if e.score is not None]
    clarity = [e.clarity_score for e in evals if e.clarity_score is not None]
    relevance = [e.relevance_score for e in evals if e.relevance_score is not None]
    depth = [e.depth_score for e in evals if e.depth_score is not None]

    return ReportOut(
        interview=InterviewOut.model_validate(interview),
        messages=[MessageOut.model_validate(m) for m in interview.messages],
        evaluations=[EvaluationOut.model_validate(e) for e in evals],
        average_score=avg(scores),
        average_clarity=avg(clarity),
        average_relevance=avg(relevance),
        average_depth=avg(depth),
    )


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _get_interview(interview_id: str, user: User, db: AsyncSession) -> Interview:
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.user_id == user.id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")
    return interview


async def _complete_interview(interview: Interview, db: AsyncSession):
    # Compute average score from all evaluations
    result = await db.execute(
        select(Evaluation).where(Evaluation.interview_id == interview.id)
    )
    evals = result.scalars().all()
    scores = [e.score for e in evals if e.score is not None]
    interview.total_score = round(sum(scores) / len(scores), 2) if scores else None
    interview.status = InterviewStatus.completed
    interview.completed_at = datetime.utcnow()

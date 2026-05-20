import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.models import InterviewStatus, InterviewDifficulty, MessageRole


# ─── User ───────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    clerk_user_id: str


class UserOut(UserBase):
    id: uuid.UUID
    clerk_user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Resume ──────────────────────────────────────────────────────────────────

class ResumeOut(BaseModel):
    id: uuid.UUID
    filename: str
    skills: list
    experience: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Interview ───────────────────────────────────────────────────────────────

class InterviewCreate(BaseModel):
    job_role: str
    difficulty: InterviewDifficulty = InterviewDifficulty.mid
    resume_id: Optional[uuid.UUID] = None


class InterviewOut(BaseModel):
    id: uuid.UUID
    job_role: str
    difficulty: InterviewDifficulty
    status: InterviewStatus
    total_score: Optional[float]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    resume_id: Optional[uuid.UUID]

    model_config = {"from_attributes": True}


# ─── Message ─────────────────────────────────────────────────────────────────

class MessageOut(BaseModel):
    id: uuid.UUID
    role: MessageRole
    content: str
    question_index: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Answer submission ───────────────────────────────────────────────────────

class AnswerSubmit(BaseModel):
    answer: str


class NextQuestionResponse(BaseModel):
    message: MessageOut
    is_complete: bool
    question_number: int
    total_questions: int


# ─── Evaluation ──────────────────────────────────────────────────────────────

class EvaluationOut(BaseModel):
    id: uuid.UUID
    question: str
    answer: str
    score: Optional[float]
    clarity_score: Optional[float]
    relevance_score: Optional[float]
    depth_score: Optional[float]
    feedback: Optional[str]
    strengths: list
    improvements: list

    model_config = {"from_attributes": True}


# ─── Report ──────────────────────────────────────────────────────────────────

class ReportOut(BaseModel):
    interview: InterviewOut
    messages: list[MessageOut]
    evaluations: list[EvaluationOut]
    average_score: Optional[float]
    average_clarity: Optional[float]
    average_relevance: Optional[float]
    average_depth: Optional[float]

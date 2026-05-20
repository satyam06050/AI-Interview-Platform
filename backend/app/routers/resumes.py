from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.models.models import User, Resume
from app.schemas.schemas import ResumeOut
from app.middleware.auth import get_current_user
from app.services.resume_parser import save_resume_file, extract_text_from_pdf
from app.services.gemini import extract_resume_info

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("/upload", response_model=ResumeOut)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    storage_path, filename = await save_resume_file(file, str(current_user.id))

    # Parse text
    parsed_text = extract_text_from_pdf(storage_path)

    # Extract skills/experience via Gemini
    info = {"skills": [], "experience": ""}
    if parsed_text:
        try:
            info = await extract_resume_info(parsed_text)
        except Exception:
            pass

    # Deactivate previous resumes
    await db.execute(
        update(Resume)
        .where(Resume.user_id == current_user.id, Resume.is_active == True)
        .values(is_active=False)
    )

    resume = Resume(
        user_id=current_user.id,
        filename=filename,
        storage_path=storage_path,
        parsed_text=parsed_text,
        skills=info["skills"],
        experience=info["experience"],
        is_active=True,
    )
    db.add(resume)
    await db.flush()
    await db.refresh(resume)
    return resume


@router.get("/", response_model=list[ResumeOut])
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
    )
    return result.scalars().all()


@router.get("/active", response_model=ResumeOut | None)
async def get_active_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.user_id == current_user.id, Resume.is_active == True)
    )
    return result.scalar_one_or_none()

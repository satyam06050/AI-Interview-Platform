import uuid
from datetime import datetime
from sqlalchemy import (
    String, Text, Boolean, Numeric, Integer,
    ForeignKey, TIMESTAMP, Enum as SAEnum, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class InterviewStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class InterviewDifficulty(str, enum.Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"


class MessageRole(str, enum.Enum):
    assistant = "assistant"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    resumes: Mapped[list["Resume"]] = relationship("Resume", back_populates="user")
    interviews: Mapped[list["Interview"]] = relationship("Interview", back_populates="user")


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    parsed_text: Mapped[str | None] = mapped_column(Text)
    skills: Mapped[dict] = mapped_column(JSON, default=list)
    experience: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="resumes")
    interviews: Mapped[list["Interview"]] = relationship("Interview", back_populates="resume")


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    resume_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    job_role: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[InterviewDifficulty] = mapped_column(SAEnum(InterviewDifficulty), default=InterviewDifficulty.mid)
    status: Mapped[InterviewStatus] = mapped_column(SAEnum(InterviewStatus), default=InterviewStatus.pending)
    total_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    started_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="interviews")
    resume: Mapped["Resume | None"] = relationship("Resume", back_populates="interviews")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="interview", order_by="Message.created_at")
    evaluations: Mapped[list["Evaluation"]] = relationship("Evaluation", back_populates="interview")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"))
    role: Mapped[MessageRole] = mapped_column(SAEnum(MessageRole), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    question_index: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    interview: Mapped["Interview"] = relationship("Interview", back_populates="messages")
    evaluation: Mapped["Evaluation | None"] = relationship("Evaluation", back_populates="message")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"))
    message_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[float | None] = mapped_column(Numeric(4, 1))
    clarity_score: Mapped[float | None] = mapped_column(Numeric(4, 1))
    relevance_score: Mapped[float | None] = mapped_column(Numeric(4, 1))
    depth_score: Mapped[float | None] = mapped_column(Numeric(4, 1))
    feedback: Mapped[str | None] = mapped_column(Text)
    strengths: Mapped[dict] = mapped_column(JSON, default=list)
    improvements: Mapped[dict] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    interview: Mapped["Interview"] = relationship("Interview", back_populates="evaluations")
    message: Mapped["Message | None"] = relationship("Message", back_populates="evaluation")

import uuid
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Float, Integer, Text, DateTime
from app.models.base import BaseModel
from typing import List

class Question(BaseModel):
    __tablename__ = "questions"

    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"), index=True)
    question_number: Mapped[str] = mapped_column(String, index=True, nullable=True)
    question_text: Mapped[str] = mapped_column(Text)
    question_type: Mapped[str] = mapped_column(String)
    confidence: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String, default="EXTRACTED")
    start_page: Mapped[int] = mapped_column(Integer)
    end_page: Mapped[int] = mapped_column(Integer)
    raw_extraction: Mapped[str] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    document: Mapped["Document"] = relationship("Document", back_populates="questions")
    options: Mapped[List["QuestionOption"]] = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    answers: Mapped[List["Answer"]] = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

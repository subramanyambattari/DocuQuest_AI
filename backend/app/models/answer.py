import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Float, Boolean, Text
from app.models.base import BaseModel

class Answer(BaseModel):
    __tablename__ = "answers"

    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id"), index=True)
    answer_value: Mapped[str] = mapped_column(Text, nullable=True)
    answer_source: Mapped[str] = mapped_column(String, default="UNKNOWN")
    confidence: Mapped[float] = mapped_column(Float)
    matched: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String, default="UNMATCHED")

    question: Mapped["Question"] = relationship("Question", back_populates="answers")

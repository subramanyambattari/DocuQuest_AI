import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Float, Text
from app.models.base import BaseModel

class QuestionOption(BaseModel):
    __tablename__ = "question_options"

    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id"), index=True)
    option_key: Mapped[str] = mapped_column(String)
    option_text: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float)

    question: Mapped["Question"] = relationship("Question", back_populates="options")

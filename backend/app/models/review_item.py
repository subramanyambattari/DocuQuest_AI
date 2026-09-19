import uuid
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Float, Text, DateTime
from app.models.base import BaseModel

class ReviewItem(BaseModel):
    __tablename__ = "review_items"

    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"), index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id"), nullable=True)
    issue_type: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String, default="PENDING")
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="review_items")

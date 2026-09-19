import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, DateTime
from datetime import datetime
from app.models.base import BaseModel
from typing import List

class Document(BaseModel):
    __tablename__ = "documents"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    filename: Mapped[str] = mapped_column(String)
    original_filename: Mapped[str] = mapped_column(String)
    file_type: Mapped[str] = mapped_column(String)
    file_size: Mapped[int] = mapped_column(Integer)
    storage_key: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, index=True, default="UPLOADED")
    processing_progress: Mapped[int] = mapped_column(Integer, default=0)
    total_pages: Mapped[int] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str] = mapped_column(String, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="documents")
    pages: Mapped[List["DocumentPage"]] = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="document", cascade="all, delete-orphan")
    jobs: Mapped[List["ProcessingJob"]] = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")
    review_items: Mapped[List["ReviewItem"]] = relationship("ReviewItem", back_populates="document", cascade="all, delete-orphan")
    relations_as_source: Mapped[List["DocumentRelation"]] = relationship("DocumentRelation", foreign_keys="DocumentRelation.source_document_id", back_populates="source_document", cascade="all, delete-orphan")
    relations_as_target: Mapped[List["DocumentRelation"]] = relationship("DocumentRelation", foreign_keys="DocumentRelation.target_document_id", back_populates="target_document", cascade="all, delete-orphan")

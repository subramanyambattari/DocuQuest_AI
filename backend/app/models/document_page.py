import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Integer, String, Float, Text
from app.models.base import BaseModel

class DocumentPage(BaseModel):
    __tablename__ = "document_pages"

    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"), index=True)
    page_number: Mapped[int] = mapped_column(Integer)
    image_path: Mapped[str] = mapped_column(String, nullable=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=True)
    ocr_text: Mapped[str] = mapped_column(Text, nullable=True)
    ocr_confidence: Mapped[float] = mapped_column(Float, nullable=True)
    rotation: Mapped[int] = mapped_column(Integer, default=0)

    document: Mapped["Document"] = relationship("Document", back_populates="pages")

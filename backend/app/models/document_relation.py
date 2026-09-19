import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String
from app.models.base import BaseModel

class DocumentRelation(BaseModel):
    __tablename__ = "document_relations"

    source_document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"), index=True)
    target_document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"), index=True)
    relation_type: Mapped[str] = mapped_column(String)

    source_document: Mapped["Document"] = relationship("Document", foreign_keys=[source_document_id], back_populates="relations_as_source")
    target_document: Mapped["Document"] = relationship("Document", foreign_keys=[target_document_id], back_populates="relations_as_target")

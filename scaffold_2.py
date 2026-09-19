import os

files = {
    "backend/app/models/base.py": """import uuid
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime
from app.core.database import Base

class BaseModel(Base):
    __abstract__ = True
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
""",
    "backend/app/models/user.py": """from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime
from datetime import datetime
from app.models.base import BaseModel
from typing import List

class User(BaseModel):
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="USER")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    documents: Mapped[List["Document"]] = relationship("Document", back_populates="user", cascade="all, delete-orphan")
""",
    "backend/app/models/document.py": """import uuid
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
""",
    "backend/app/models/document_page.py": """import uuid
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
""",
    "backend/app/models/question.py": """import uuid
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
""",
    "backend/app/models/question_option.py": """import uuid
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
""",
    "backend/app/models/answer.py": """import uuid
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
""",
    "backend/app/models/processing_job.py": """import uuid
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Integer, DateTime
from app.models.base import BaseModel

class ProcessingJob(BaseModel):
    __tablename__ = "processing_jobs"

    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"), index=True)
    celery_task_id: Mapped[str] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="QUEUED")
    current_stage: Mapped[str] = mapped_column(String, default="QUEUED")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str] = mapped_column(String, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="jobs")
""",
    "backend/app/models/review_item.py": """import uuid
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
""",
    "backend/app/models/document_relation.py": """import uuid
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
""",
    "backend/app/models/__init__.py": """from app.models.base import BaseModel
from app.models.user import User
from app.models.document import Document
from app.models.document_page import DocumentPage
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.answer import Answer
from app.models.processing_job import ProcessingJob
from app.models.review_item import ReviewItem
from app.models.document_relation import DocumentRelation
"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath) or '.', exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Batch 2 generated.")

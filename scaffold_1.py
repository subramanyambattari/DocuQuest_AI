import os

files = {
    ".env.example": """DATABASE_URL=postgresql://user:password@postgres:5432/docuquest
REDIS_URL=redis://redis:6379/0
JWT_SECRET=supersecretjwtkey_change_in_production
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
MAX_FILE_SIZE_MB=50
""",
    ".gitignore": """.env
__pycache__/
*.pyc
.pytest_cache/
alembic.ini.bak
node_modules/
.next/
""",
    "docker-compose.yml": """version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: docuquest
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d docuquest"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  backend:
    build:
      context: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/docuquest
      - REDIS_URL=redis://redis:6379/0
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - MINIO_BUCKET=documents
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_started
    volumes:
      - ./backend:/app

  worker:
    build:
      context: ./backend
    command: celery -A app.workers.celery_app worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/docuquest
      - REDIS_URL=redis://redis:6379/0
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - MINIO_BUCKET=documents
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  minio_data:
""",
    "backend/requirements.txt": """fastapi==0.109.0
uvicorn==0.27.0
sqlalchemy[asyncio]==2.0.25
alembic==1.13.1
asyncpg==0.29.0
psycopg2-binary==2.9.9
pydantic==2.5.3
pydantic-settings==2.1.0
celery==5.3.6
redis==5.0.1
pytest==8.0.0
pytest-asyncio==0.23.4
httpx==0.26.0
""",
    "backend/Dockerfile": """FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
""",
    "backend/app/core/config.py": """from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Document Intelligence & Question Extraction Service"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    REDIS_URL: str = Field("redis://localhost:6379/0", env="REDIS_URL")
    JWT_SECRET: str = Field("secret", env="JWT_SECRET")
    
    MINIO_ENDPOINT: str = Field("localhost:9000", env="MINIO_ENDPOINT")
    MINIO_ACCESS_KEY: str = Field("minioadmin", env="MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY: str = Field("minioadmin", env="MINIO_SECRET_KEY")
    MINIO_BUCKET: str = Field("documents", env="MINIO_BUCKET")
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
""",
    "backend/app/core/database.py": """from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# asyncpg URL
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath) or '.', exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Batch 1 generated.")

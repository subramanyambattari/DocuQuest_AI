# Document Intelligence & Question Extraction Service

## Overview
A scalable Document Processing & Question Extraction Service built to accept PDFs and images and convert them into structured, machine-readable questions using PyMuPDF, PaddleOCR, and AI Vision models.

## Architecture
- **Frontend**: Next.js
- **Backend**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy 2 & Alembic
- **Async Processing**: Celery & Redis
- **Storage**: MinIO (S3-compatible)

## Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend dev)
- Python 3.11 (for local backend dev)

## Environment Setup
1. Copy `.env.example` to `.env`.
2. Ensure values are correctly populated.

## Docker Startup
```bash
docker compose up -d --build
```

## Database Migration
```bash
docker compose exec backend alembic upgrade head
```

## Health Endpoint
```bash
curl http://localhost:8000/api/v1/health
```

## Current Status (Phase 1-2)
- ✅ Project structure established
- ✅ Docker Compose orchestrated (Postgres, Redis, MinIO, Backend, Worker, Frontend)
- ✅ Database Schema & SQLAlchemy models mapped
- ✅ Alembic configured

## Next Planned Phases
- Phase 3 & 4: Auth and Upload capabilities
- Phase 5 to 8: Async Processing & OCR integration

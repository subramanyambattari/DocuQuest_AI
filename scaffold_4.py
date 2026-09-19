import os

files = {
    "frontend/Dockerfile": """FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
""",
    "frontend/package.json": """{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
""",
    "frontend/app/page.tsx": """export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Document Intelligence & Question Extraction</h1>
      <p className="mt-4 text-xl">Service is running.</p>
    </main>
  );
}
""",
    "frontend/app/layout.tsx": """import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Intelligence",
  description: "Document Intelligence Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
""",
    "frontend/next.config.js": """/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
""",
    "backend/tests/test_health.py": """from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Document Intelligence API is running"}
""",
    "README.md": """# Document Intelligence & Question Extraction Service

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
""",
    "docs/architecture.md": """# Architecture

## Overall Architecture
The system uses a modern frontend/backend split with background processing for heavy document extraction tasks.

```mermaid
flowchart TD
    A[Next.js Frontend] --> B[FastAPI REST API]
    B --> C[(PostgreSQL)]
    B --> D[Redis Queue]
    B --> E[MinIO Object Storage]
    D --> F[Celery Worker]
    F --> G[PyMuPDF]
    F --> H[PaddleOCR]
    F --> I[AI Service / Gemini]
    F --> J[Question Extraction & Answer Matching]
    J --> C
```
"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath) or '.', exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Batch 4 generated.")

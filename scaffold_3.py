import os

files = {
    "backend/app/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.health import router as health_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_V1_STR)
""",
    "backend/app/api/health.py": """from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "message": "Document Intelligence API is running"}
""",
    "backend/app/api/__init__.py": "",
    "backend/alembic.ini": """[alembic]
script_location = migrations
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = postgresql+asyncpg://user:password@localhost:5432/docuquest

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
""",
    "backend/migrations/env.py": """import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

from app.core.config import settings
from app.models import BaseModel

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = BaseModel.metadata

def get_url():
    return settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()
    
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
""",
    "backend/migrations/script.py.mako": """\"\"\"${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

\"\"\"
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
""",
    "backend/app/workers/celery_app.py": """from celery import Celery
import os

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("document_worker", broker=redis_url, backend=redis_url)

celery_app.conf.task_routes = {
    "app.workers.*": "main-queue",
}

@celery_app.task
def test_worker():
    return "Worker is ready!"
""",
    "backend/app/services/storage_service.py": """import os

class StorageService:
    def __init__(self):
        self.endpoint = os.environ.get("MINIO_ENDPOINT")
        self.access_key = os.environ.get("MINIO_ACCESS_KEY")
        self.secret_key = os.environ.get("MINIO_SECRET_KEY")
        self.bucket = os.environ.get("MINIO_BUCKET")
        # Initialize boto3 or minio client here when implemented

    def upload(self, file_path: str, object_name: str):
        pass

    def download(self, object_name: str, file_path: str):
        pass

    def delete(self, object_name: str):
        pass

    def exists(self, object_name: str) -> bool:
        return False

    def generate_presigned_url(self, object_name: str) -> str:
        return ""
"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath) or '.', exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Batch 3 generated.")

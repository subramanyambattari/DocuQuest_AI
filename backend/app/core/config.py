from pydantic_settings import BaseSettings, SettingsConfigDict
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

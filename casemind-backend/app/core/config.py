import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "casemind"
    JWT_SECRET: str = "super-secret-key-change-this-in-production-1234567890"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    MISTRAL_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

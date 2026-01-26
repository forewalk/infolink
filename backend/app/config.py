"""
애플리케이션 설정
"""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # 프로젝트 정보
    PROJECT_NAME: str = "Infolink API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # 서버 설정
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS (개발 환경에서는 main.py에서 allow_origins=["*"]로 설정)
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # 데이터베이스
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost/infolink_dev"
    DATABASE_URL_TEST: Optional[str] = "postgresql+asyncpg://postgres:postgres@localhost/infolink_test"

    # JWT 설정
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()

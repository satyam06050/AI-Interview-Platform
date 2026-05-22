from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://interview_user:interview_pass@localhost:5432/interview_db"

    # Clerk
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_JWT_ISSUER: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    # App
    APP_ENV: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000"
    MAX_QUESTIONS_PER_INTERVIEW: int = 6

    class Config:
        env_file = ".env.local"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()

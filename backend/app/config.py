from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FIREBASE_PROJECT_ID: str = "vemakin"
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()

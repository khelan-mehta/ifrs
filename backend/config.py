from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mongodb_uri: str
    database_name: str = "ifrs_dashboard"
    openai_api_key: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60
    redis_url: str = "redis://localhost:6379/0"
    upload_dir: str = "./uploads"
    cors_origins: str = "http://localhost:5173"

    # OpenAI settings
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536
    chat_model: str = "gpt-4o"
    chunk_size: int = 800
    chunk_overlap: int = 100

    # FAISS vector store
    faiss_index_dir: str = "./faiss_data"

    # File upload limits
    max_file_size_mb: int = 50
    allowed_extensions: str = ".pdf"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

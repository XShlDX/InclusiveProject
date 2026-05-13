import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    api_key: str = os.getenv("API_KEY", "")
    model_name: str = os.getenv("MODEL_NAME", "gemini-2.5-flash")

    # Для локальной разработки можно поставить SQLite, для продакшена — PostgreSQL
    # Vercel: задай DATABASE_URL в Environment Variables
    database_url: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./responses.db"
    )

    # Neon / Supabase возвращают postgres://, SQLAlchemy требует postgresql://
    def __post_init__(self):
        if self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql://", 1)


config_obj = Config()

# Патч для postgres:// → postgresql:// (актуально для Neon, Railway, Supabase)
if config_obj.database_url.startswith("postgres://"):
    config_obj.database_url = config_obj.database_url.replace("postgres://", "postgresql://", 1)

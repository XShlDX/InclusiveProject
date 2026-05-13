import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    api_key: str = os.getenv("API_KEY", "")
    model_name: str = os.getenv("MODEL_NAME", "gemini-2.5-flash")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./responses.db")


config_obj = Config()

if config_obj.database_url.startswith("postgres://"):
    config_obj.database_url = config_obj.database_url.replace("postgres://", "postgresql://", 1)

print(f"[CONFIG] DATABASE_URL starts with: {config_obj.database_url[:20]}")
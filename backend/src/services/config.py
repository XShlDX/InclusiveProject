import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    api_key = os.getenv("API_KEY")
    model_name = os.getenv("MODEL_NAME", "gemini-2.5-flash")

config_obj = Config()
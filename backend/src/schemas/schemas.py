from pydantic import BaseModel
from typing import Optional

class Prompt(BaseModel):
    content: str

class UsersPrompt(BaseModel):
    content: str
    prompt: str


class Base(BaseModel):
    pass

class AnswersModel(Base):
    prompt: str
    response: str

class AIResponse(BaseModel):
    action: Optional[str] = None
    reply: str
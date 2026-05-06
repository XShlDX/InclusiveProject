from pydantic import BaseModel


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
from typing import Annotated

from fastapi import FastAPI, Depends
from pydantic import BaseModel

from src.ai import chat

app = FastAPI()
#  uvicorn main:app --reload
history = []

class Prompt(BaseModel):
    role: str
    content: str

class UsersPrompt(BaseModel):
    id: int
    content: str
    response: str


@app.post('/ai')
async def get_answer(message: Annotated[Prompt, Depends()]):
    role = message.role
    content = message.content
    new_id = len(history) + 1
    resp = await chat(role, content)

    entry = {
        "id": new_id,
        "message": content,
        "response": resp
    }
    history.append(entry)
    return resp

@app.get('/history')
def get_history():
    return history
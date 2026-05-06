from typing import Annotated
from urllib import response

import uvicorn
from fastapi import FastAPI, Depends
from pydantic import BaseModel
import asyncio
from ollama import AsyncClient

app = FastAPI()
#  uvicorn main:app --reload
history = []

async def chat(role, content):
    messages = [{'role': role, 'content': content}]
    client = AsyncClient()
    response = await client.chat('llama3:latest', messages=messages)
    return response['message']['content']

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

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
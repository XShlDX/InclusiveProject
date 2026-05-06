import asyncio

from ollama import AsyncClient
from pydantic import BaseModel

class Base(BaseModel):
    pass


class AnswersModel(Base):
    prompt: str
    response: str


async def chat(role, content):
    messages = [{'role': role, 'content': content}]
    client = AsyncClient()
    response = await client.chat('llama3:latest', messages=messages)
    return response['message']['content']
#  uvicorn main:app --reload
from contextlib import asynccontextmanager
from ipaddress import ip_address
from typing import Annotated
import uvicorn
from fastapi import FastAPI, Depends, Request, Body
from pydantic import BaseModel
from ollama import AsyncClient
from fastapi.middleware.cors import CORSMiddleware

from src.ai import chat
from src.models import Base, engine, get_user_requests, add_user_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    print("Tables created successfully.")
    yield

app = FastAPI(lifespan=lifespan,
              title="AI Chat API")

origins = [
    "http://localhost",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Prompt(BaseModel):
    content: str

class UsersPrompt(BaseModel):
    content: str
    prompt: str


@app.post('/ai')
async def get_answer(request: Request, prompt: Annotated[Prompt, Depends()]):
    prompt = prompt.content
    resp = await chat(prompt)
    user_ip_address = request.client.host
    add_user_data(ip_address=user_ip_address, prompt=prompt, response=resp)
    return resp

@app.get('/requests')
def get_requests(request: Request):
    user_ip_address = request.client.host
    user_requests = get_user_requests(ip_address=user_ip_address)
    return user_requests

@app.get('/history')
def get_history():
    return {"Hello"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse
from typing import Annotated

from src.services.ai import chat
from src.models.models import add_user_data, get_user_requests
from src.schemas.schemas import Prompt
from src.services.config import join_path

router = APIRouter(
    prefix="/requests",
)


@router.post('/')
async def get_answer(request: Request, prompt: Annotated[Prompt, Depends()]):
    prompt = prompt.content
    resp = await chat(prompt)
    user_ip_address = request.client.host
    add_user_data(ip_address=user_ip_address, prompt=prompt, response=resp)
    return resp

@router.get('/')
def get_requests(request: Request):
    user_ip_address = request.client.host
    user_requests = get_user_requests(ip_address=user_ip_address)
    return user_requests

@router.get("/")
async def serve_index():
    return FileResponse(join_path)
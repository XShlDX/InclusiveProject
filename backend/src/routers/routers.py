from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse
from typing import Annotated

from src.services.ai import chat
from src.models.models import add_user_data, get_user_requests
from src.schemas.schemas import Prompt
from src.services.config import HTML_FILE_PATH

router = APIRouter()


@router.post('/requests')
async def get_answer(request: Request, prompt: Annotated[Prompt, Depends()]):
    prompt = prompt.content
    resp = await chat(prompt)
    user_ip_address = request.client.host
    add_user_data(ip_address=user_ip_address, prompt=prompt, response=resp)
    return resp

@router.get('/requests')
def get_requests(request: Request):
    user_ip_address = request.client.host
    user_requests = get_user_requests(ip_address=user_ip_address)
    return user_requests

@router.get("/")
async def serve_index():
    return FileResponse(HTML_FILE_PATH)
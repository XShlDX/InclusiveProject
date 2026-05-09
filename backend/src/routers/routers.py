from fastapi import APIRouter, Request

from src.services.ai import response_ai_answer
from src.models.models import add_user_data, get_user_requests
from src.schemas.schemas import Prompt


router = APIRouter(prefix="/requests",tags=["AI Chat"])


@router.post('/')
async def get_answer(request: Request, prompt: Prompt):
    prompt = prompt.content
    resp = await response_ai_answer(prompt)
    user_ip_address = request.client.host
    add_user_data(ip_address=user_ip_address, prompt=prompt, response=resp)
    return resp

@router.get('/')
def get_requests(request: Request):
    user_ip_address = request.client.host
    user_requests = get_user_requests(ip_address=user_ip_address)
    return user_requests


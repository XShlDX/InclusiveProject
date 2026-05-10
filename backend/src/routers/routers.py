import re
from fastapi import APIRouter, Request
import json
from src.services.ai import response_ai_answer
from src.models.models import add_user_data, get_user_requests
from src.schemas.schemas import Prompt, AIResponse


router = APIRouter(prefix="/requests",tags=["AI Chat"])


@router.post('/')
async def get_answer(request: Request, prompt: Prompt):
    prompt_text = prompt.content
    resp = await response_ai_answer(prompt_text)

    user_ip_address = request.client.host
    add_user_data(ip_address=user_ip_address, prompt=prompt_text, response=resp)

    try:
        match = re.search(r'\{[\s\S]*\}', resp)
        if match:
            data = json.loads(match.group())
            if 'action' in data and 'reply' in data:
                return AIResponse(action=data['action'], reply=data['reply'])
    except Exception:
        pass

    return AIResponse(reply=resp)

@router.get('/')
def get_requests(request: Request):
    user_ip_address = request.client.host
    user_requests = get_user_requests(ip_address=user_ip_address)
    return user_requests


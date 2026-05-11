import re
import json
from fastapi import APIRouter, Request, HTTPException
from src.services.ai import response_ai_answer
from src.models.models import add_user_data, get_user_requests
from src.schemas.schemas import Prompt, AIResponse
from google.genai import errors  # Импортируем ошибки библиотеки Google

router = APIRouter(prefix="/requests", tags=["AI Chat"])


@router.post('/')
async def get_answer(request: Request, prompt: Prompt):
    prompt_text = prompt.content
    page = prompt.page

    try:
        # Пытаемся получить ответ от ИИ
        resp = await response_ai_answer(prompt_text, page)
    except errors.ServerError:
        # Если Google перегружен (ошибка 503)
        raise HTTPException(
            status_code=503,
            detail="ИИ перегружен. Пожалуйста, подождите минуту и попробуйте снова."
        )
    except Exception as e:
        # Для всех остальных ошибок
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

    user_ip_address = request.client.host
    add_user_data(ip_address=user_ip_address, prompt=prompt_text, response=resp)

    # Логика обработки JSON в ответе
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

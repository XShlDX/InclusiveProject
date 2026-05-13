from google import genai
from google.genai import types

from src.services.config import config_obj
from src.services.prompt import role_prompt_for_incl, build_role_prompt_for_regular

# Ленивая инициализация клиента и чатов — важно для serverless
CHATS: dict = {}
_client = None


def get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=config_obj.api_key)
    return _client


def get_or_init_chats() -> dict:
    if CHATS:
        return CHATS

    from src.models.tasksDB import get_task

    client = get_client()
    task = get_task(1)
    questions, answers, options = {}, {}, {}

    if task:
        for question in task.questions:
            questions[question.id] = question.text
            answers[question.id] = question.correct_option
            options[question.id] = {opt.index: opt.text for opt in question.options}

    correct_answers = {
        q_id: options[q_id][answers[q_id]] for q_id in answers
    }

    CHATS["incl"] = client.aio.chats.create(
        model=config_obj.model_name,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=2048,
            system_instruction=role_prompt_for_incl,
        )
    )
    CHATS["main"] = client.aio.chats.create(
        model=config_obj.model_name,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=2048,
            system_instruction=build_role_prompt_for_regular(questions, correct_answers),
        )
    )

    return CHATS


def init_chats():
    get_or_init_chats()


async def response_ai_answer(prompt: str, page: str) -> str | None:
    chats = get_or_init_chats()
    chat = chats.get(page, chats.get("incl"))
    response = await chat.send_message(prompt)
    return response.text
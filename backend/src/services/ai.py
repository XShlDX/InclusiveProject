from google import genai
from google.genai import types

from src.services.config import config_obj
from src.services.prompt import role_prompt

client = genai.Client(api_key=config_obj.api_key)

chat = client.aio.chats.create(
    model=config_obj.model_name,
    config=types.GenerateContentConfig(
        temperature=0.7,
        max_output_tokens=2048,
        system_instruction=role_prompt,
    )
)

async def response_ai_answer(prompt: str) -> str | None:
    response = await chat.send_message(prompt)
    return response.text
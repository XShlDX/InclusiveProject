from ollama import AsyncClient


async def chat(content):
    messages = [{'role': 'user', 'content': content}]
    client = AsyncClient()
    response = await client.chat('llama3:latest', messages=messages)
    return response['message']['content']
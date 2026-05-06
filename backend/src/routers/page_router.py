from fastapi import APIRouter
from fastapi.responses import FileResponse
from src.services.config import HTML_FILE_PATH
router = APIRouter()


@router.get("/")
async def serve_index():
    return FileResponse(HTML_FILE_PATH)
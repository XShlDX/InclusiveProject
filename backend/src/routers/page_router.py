from fastapi import APIRouter
from fastapi.responses import FileResponse
from src.services.page_connetion import HTML_FILE_PATH
router = APIRouter(tags=["pages for frontend"])


@router.get("/")
async def serve_index():
    return FileResponse(HTML_FILE_PATH)
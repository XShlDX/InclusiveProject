from fileinput import filename

from fastapi import APIRouter, UploadFile
from fastapi.responses import FileResponse

router = APIRouter(
    prefix="/files",
)

@router.post("/upload")
async def upload_file(uploaded_files: list[UploadFile]):
    for uploaded_file in uploaded_files:
        file = uploaded_file.file
        filename = uploaded_file.filename
        with open(filename, "wb") as f:
            f.write(file.read())


@router.get('/load/{file_name}')
async def get_file(file_name: str):
    return FileResponse(file_name)
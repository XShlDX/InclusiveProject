import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from src.models.models import Base, engine
from src.routers.routers import router as requests_router
from src.schemas.file_loader import router as file_loader


from fastapi.responses import FileResponse



@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    print("Tables created successfully.")
    yield

app = FastAPI(lifespan=lifespan,
              title="AI Chat API")



app.include_router(requests_router)
app.include_router(file_loader)

origins = [
    "http://localhost",
    "http://localhost:5000",
    "http://127.0.0.1",
    "http://127.0.0.1:5000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



#### ДЛЯ ЗАПУСКА index.html в папке frontend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
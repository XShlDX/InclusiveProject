from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from src.models.models import Base, engine
from src.routers.routers import router as requests_router
from src.routers.tasks_router import router as tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    print("Tables created successfully.")
    yield


app = FastAPI(
    lifespan=lifespan,
    title="AI Chat API",
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

origins = [
    "http://localhost",
    "http://localhost:5000",
    "http://127.0.0.1",
    "http://127.0.0.1:5000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(requests_router)
app.include_router(tasks_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
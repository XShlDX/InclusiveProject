
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.staticfiles import StaticFiles

from src.models.models import Base, engine
from src.routers.routers import router as requests_router
from src.routers.page_router import router as page_router
from src.routers.tasks_router import router as tasks_router
from src.services.page_connetion import join_path


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    print("Tables created successfully.")
    yield

app = FastAPI(lifespan=lifespan,
              title="AI Chat API")


app.add_middleware(GZipMiddleware, minimum_size=1000)
app.include_router(requests_router)
app.include_router(tasks_router)


#### ДЛЯ ЗАПУСКА index.html в папке frontend
app.mount("/frontend", StaticFiles(directory=join_path), name="frontend")
app.include_router(page_router)

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



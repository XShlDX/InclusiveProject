from fastapi import APIRouter, HTTPException

from src.models.tasksDB import create_task, get_task
from src.schemas.taskSchemas import TaskCreateSchema, TaskResponseSchema

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponseSchema)
def post_task(data: TaskCreateSchema):
    task = create_task(
        title=data.title,
        description=data.description,
        questions_data=data.questions
    )
    return task


@router.get("/{task_id}", response_model=TaskResponseSchema)
def fetch_task(task_id: int):
    task = get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Таск не найден")
    return task

@router.post("/seed", response_model=list[TaskResponseSchema])
def seed_tasks(data: list[TaskCreateSchema]):
    result = []
    for task_data in data:
        task = create_task(
            title=task_data.title,
            description=task_data.description,
            questions_data=task_data.questions
        )
        result.append(task)
    return result
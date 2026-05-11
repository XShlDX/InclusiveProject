from fastapi import APIRouter, HTTPException, Depends
from src.models.tasksDB import create_task, get_task, seed_quiz_topics, get_all_quiz_topics
from src.schemas.taskSchemas import TaskCreateSchema, TaskResponseSchema, SubmitResponseSchema, SubmitSchema, \
    QuizTopicCreateSchema

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponseSchema)
def post_task(data: TaskCreateSchema):
    task = create_task(
        title=data.title,
        description=data.description,
        questions_data=data.questions
    )
    return task

@router.post("/quiz/seed")
def seed_quiz(topics: list[QuizTopicCreateSchema]):
    seed_quiz_topics([t.model_dump() for t in topics])
    return {"detail": "Готово"}

@router.get("/quiz/topics")
def get_quiz_topics():
    return get_all_quiz_topics()

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

@router.post("/{task_id}/submit", response_model=SubmitResponseSchema)
def submit_task(task_id: int, data: SubmitSchema):
    task = get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Таск не найден")

    if len(data.answers) != len(task.questions):
        raise HTTPException(status_code=400, detail="Количество ответов не совпадает с количеством вопросов")

    correct = []
    score = 0

    for question, user_answer in zip(task.questions, data.answers):
        is_correct = question.correct_option == user_answer
        correct.append(is_correct)
        if is_correct:
            score += 1

    return SubmitResponseSchema(
        score=score,
        total=len(task.questions),
        correct=correct
    )

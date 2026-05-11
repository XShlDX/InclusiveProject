from pydantic import BaseModel


class OptionSchema(BaseModel):
    text: str
    index: int

    class Config:
        from_attributes = True


class QuestionPublicSchema(BaseModel):
    id: int
    text: str
    options: list[OptionSchema]

    class Config:
        from_attributes = True


class QuestionCreateSchema(BaseModel):
    text: str
    correct_option: int
    options: list[OptionSchema]


class TaskCreateSchema(BaseModel):
    title: str
    description: str
    questions: list[QuestionCreateSchema]


class TaskResponseSchema(BaseModel):
    id: int
    title: str
    description: str
    questions: list[QuestionPublicSchema]

    class Config:
        from_attributes = True

class SubmitSchema(BaseModel):
    answers: list[int]

class SubmitResponseSchema(BaseModel):
    score: int
    total: int
    correct: list[bool]

class QuizAnswerSchema(BaseModel):
    text: str
    index: int

class QuizQuestionSchema(BaseModel):
    text: str
    correct: int
    answers: list[str]
    image: str | None = None
    image_alt: str | None = None

class QuizTopicCreateSchema(BaseModel):
    id: str
    name: str
    icon: str
    color: str | None = None
    questions: list[QuizQuestionSchema]
from sqlalchemy import String, ForeignKey, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

from src.models.models import Base, session


class TasksTable(Base):
    __tablename__ = 'tasks'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column()

    questions: Mapped[list["QuestionTable"]] = relationship(back_populates="task", lazy="selectin")


class QuestionTable(Base):
    __tablename__ = 'questions'

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"))
    text: Mapped[str] = mapped_column()
    correct_option: Mapped[int] = mapped_column()

    task: Mapped["TasksTable"] = relationship(back_populates="questions")
    options: Mapped[list["OptionTable"]] = relationship(back_populates="question", lazy="selectin")


class OptionTable(Base):
    __tablename__ = 'options'

    id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"))
    text: Mapped[str] = mapped_column(String(255))
    index: Mapped[int] = mapped_column()

    question: Mapped["QuestionTable"] = relationship(back_populates="options")

def create_task(title: str, description: str, questions_data: list) -> TasksTable:
    with session() as new_session:
        task = TasksTable(title=title, description=description)
        new_session.add(task)
        new_session.flush()

        for q_data in questions_data:
            question = QuestionTable(
                task_id=task.id,
                text=q_data.text,
                correct_option=q_data.correct_option
            )
            new_session.add(question)
            new_session.flush()

            for opt in q_data.options:
                option = OptionTable(
                    question_id=question.id,
                    text=opt.text,
                    index=opt.index
                )
                new_session.add(option)

        new_session.commit()
        new_session.refresh(task)
        return task


def get_task(task_id: int) -> TasksTable | None:
    with session() as new_session:
        query = select(TasksTable).filter_by(id=task_id)
        result = new_session.execute(query)
        return result.scalars().first()

#####################################

class QuizTopicTable(Base):
    __tablename__ = 'quiz_topics'

    id: Mapped[int] = mapped_column(primary_key=True)
    topic_id: Mapped[str] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(10))
    color: Mapped[str] = mapped_column(String(20))

    questions: Mapped[list["QuizQuestionTable"]] = relationship(back_populates="topic", lazy="selectin")


class QuizQuestionTable(Base):
    __tablename__ = 'quiz_questions'

    id: Mapped[int] = mapped_column(primary_key=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey("quiz_topics.id"))
    text: Mapped[str] = mapped_column()
    correct: Mapped[int] = mapped_column()
    image: Mapped[str | None] = mapped_column(nullable=True)
    image_alt: Mapped[str | None] = mapped_column(nullable=True)

    topic: Mapped["QuizTopicTable"] = relationship(back_populates="questions")
    answers: Mapped[list["QuizAnswerTable"]] = relationship(back_populates="question", lazy="selectin")


class QuizAnswerTable(Base):
    __tablename__ = 'quiz_answers'

    id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("quiz_questions.id"))
    text: Mapped[str] = mapped_column(String(255))
    index: Mapped[int] = mapped_column()

    question: Mapped["QuizQuestionTable"] = relationship(back_populates="answers")

def seed_quiz_topics(topics: list[dict]) -> None:
    with session() as new_session:
        for topic in topics:
            existing = new_session.scalars(
                select(QuizTopicTable).filter_by(topic_id=topic["id"])
            ).first()
            if existing:
                continue

            quiz_topic = QuizTopicTable(
                topic_id=topic["id"],
                name=topic["name"],
                icon=topic["icon"],
                color=topic.get("color", ""),
            )
            new_session.add(quiz_topic)
            new_session.flush()

            for q in topic["questions"]:
                question = QuizQuestionTable(
                    topic_id=quiz_topic.id,
                    text=q["text"],
                    correct=q["correct"],
                    image=q.get("image"),
                    image_alt=q.get("image_alt"),
                )
                new_session.add(question)
                new_session.flush()

                for idx, answer_text in enumerate(q["answers"]):
                    answer = QuizAnswerTable(
                        question_id=question.id,
                        text=answer_text,
                        index=idx,
                    )
                    new_session.add(answer)

        new_session.commit()

def get_all_quiz_topics():
    with session() as new_session:
        query = select(QuizTopicTable)
        result = new_session.execute(query)
        return result.unique().scalars().all()


def get_task(task_id: int) -> TasksTable | None:
    with session() as new_session:
        query = select(TasksTable).filter_by(id=task_id)
        result = new_session.execute(query)
        return result.unique().scalars().first()
from sqlalchemy import String, ForeignKey, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

from src.models.models import Base, session


class TasksTable(Base):
    __tablename__ = 'tasks'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column()

    questions: Mapped[list["QuestionTable"]] = relationship(back_populates="task", lazy="joined")


class QuestionTable(Base):
    __tablename__ = 'questions'

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"))
    text: Mapped[str] = mapped_column()
    correct_option: Mapped[int] = mapped_column()

    task: Mapped["TasksTable"] = relationship(back_populates="questions")
    options: Mapped[list["OptionTable"]] = relationship(back_populates="question", lazy="joined")


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
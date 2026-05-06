from sqlalchemy import engine, select
from sqlalchemy.orm import Mapped, sessionmaker, DeclarativeBase
from sqlalchemy.testing.schema import mapped_column

engine = engine.create_engine('sqlite:///responses.db', echo=True)
session = sessionmaker(engine)

class Base(DeclarativeBase):
    pass

class ResponseTable(Base):
    __tablename__ = 'response'

    id : Mapped[int] = mapped_column( primary_key=True)
    ip_address : Mapped[str] = mapped_column(index = True)
    message : Mapped[str]
    response : Mapped[str]




def get_user_requests(ip_address: str) -> list[ResponseTable]:
    with session() as new_session:
        query = select(ResponseTable).filter_by(ip_address=ip_address)
        result = new_session.execute(query)
        return result.scalars().all()

def add_user_data(ip_address: str, prompt: str, response: str) -> None:
    with session() as new_session:
        new_request = ResponseTable(
            ip_address=ip_address,
            message=prompt,
            response=response
        )
        new_session.add(new_request)
        new_session.commit()


def get_response():
    return session.query(ResponseTable).all()
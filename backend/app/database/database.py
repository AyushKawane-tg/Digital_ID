from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def init_db():
    from sqlalchemy import inspect, text

    from app.database.models import (
        User,
        Company,
        Employee,
        CompanyLocation,
        CompanyBadge,
        ImportJob,
    )

    Base.metadata.create_all(bind=engine)

    # Lightweight migration: add columns introduced after the
    # initial schema was created (SQLite create_all won't alter
    # existing tables).
    inspector = inspect(engine)

    try:
        employee_columns = {
            col["name"]
            for col in inspector.get_columns("employees")
        }
    except Exception:
        employee_columns = set()

    if employee_columns and "date_of_joining" not in employee_columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE employees "
                    "ADD COLUMN date_of_joining DATE"
                )
            )

    if employee_columns and "import_job_id" not in employee_columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE employees "
                    "ADD COLUMN import_job_id INTEGER"
                )
            )
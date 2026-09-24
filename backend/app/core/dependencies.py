from typing import Generator

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import User


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.is_active.is_(True),
        )
        .first()
    )

    if not user:
        request.session.clear()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive user",
        )

    return user


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


def require_employee(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != "EMPLOYEE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee access required",
        )

    return current_user
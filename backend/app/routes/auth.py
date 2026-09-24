from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import RedirectResponse

from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import verify_password
from app.database.models import User


router = APIRouter(tags=["Authentication"])


@router.get("/login")
def login_page(request: Request):
    return request.app.state.templates.TemplateResponse(
        "auth/login.html",
        {"request": request},
    )


@router.post("/login")
def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.email == email,
            User.is_active.is_(True),
        )
        .first()
    )

    if not user or not verify_password(
        password,
        user.password_hash,
    ):
        return request.app.state.templates.TemplateResponse(
            "auth/login.html",
            {
                "request": request,
                "error": "Invalid email or password",
            },
            status_code=401,
        )

    request.session["user_id"] = user.id
    request.session["role"] = user.role

    if user.role == "ADMIN":
        return RedirectResponse(
            "/admin/dashboard",
            status_code=303,
        )

    return RedirectResponse(
        "/employee/dashboard",
        status_code=303,
    )


@router.get("/logout")
def logout(request: Request):
    request.session.clear()

    return RedirectResponse(
        "/login",
        status_code=303,
    )
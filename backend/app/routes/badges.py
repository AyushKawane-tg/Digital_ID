from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    Form,
    Request,
    UploadFile,
    File,
)
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_db, require_admin
from app.database.models import Company, CompanyBadge, User


router = APIRouter(
    prefix="/admin/badges",
    tags=["Badges & Certificates"],
)


IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _save_badge_image(file: UploadFile) -> str | None:
    if not file or not file.filename:
        return None

    extension = IMAGE_EXTENSIONS.get(file.content_type)
    if not extension:
        return None

    directory = Path(settings.UPLOAD_DIR) / "badges"
    directory.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    file_path = directory / filename
    file_path.write_bytes(file.file.read())

    return f"/uploads/badges/{filename}"


@router.get("")
def badges_page(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    badges = (
        db.query(CompanyBadge)
        .order_by(CompanyBadge.created_at.desc())
        .all()
    )

    return request.app.state.templates.TemplateResponse(
        "admin/badges/list.html",
        {
            "request": request,
            "current_user": current_user,
            "badges": badges,
        },
    )


@router.get("/add")
def badge_add_page(
    request: Request,
    current_user: User = Depends(require_admin),
):
    return request.app.state.templates.TemplateResponse(
        "admin/badges/form.html",
        {
            "request": request,
            "current_user": current_user,
            "badge": None,
        },
    )


@router.post("/add")
def badge_create(
    title: str = Form(...),
    description: str = Form(""),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = db.query(Company).first()

    if not company:
        company = Company(name="TeleGlobal International")
        db.add(company)
        db.flush()

    badge = CompanyBadge(
        company_id=company.id,
        title=title.strip(),
        description=description.strip() or None,
        image_path=_save_badge_image(image),
    )

    db.add(badge)
    db.commit()

    return RedirectResponse(
        "/admin/badges",
        status_code=303,
    )


@router.get("/{badge_id}/edit")
def badge_edit_page(
    badge_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    badge = (
        db.query(CompanyBadge)
        .filter(CompanyBadge.id == badge_id)
        .first()
    )

    if not badge:
        return RedirectResponse(
            "/admin/badges",
            status_code=303,
        )

    return request.app.state.templates.TemplateResponse(
        "admin/badges/form.html",
        {
            "request": request,
            "current_user": current_user,
            "badge": badge,
        },
    )


@router.post("/{badge_id}/edit")
def badge_update(
    badge_id: int,
    title: str = Form(...),
    description: str = Form(""),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    badge = (
        db.query(CompanyBadge)
        .filter(CompanyBadge.id == badge_id)
        .first()
    )

    if not badge:
        return RedirectResponse(
            "/admin/badges",
            status_code=303,
        )

    badge.title = title.strip()
    badge.description = description.strip() or None

    new_image = _save_badge_image(image)
    if new_image:
        badge.image_path = new_image

    db.commit()

    return RedirectResponse(
        "/admin/badges",
        status_code=303,
    )
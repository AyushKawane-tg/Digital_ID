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
from app.database.models import Company, User


router = APIRouter(
    prefix="/admin/company",
    tags=["Company"],
)


IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _save_company_logo(file: UploadFile) -> str | None:
    if not file or not file.filename:
        return None

    extension = IMAGE_EXTENSIONS.get(file.content_type)
    if not extension:
        return None

    directory = Path(settings.UPLOAD_DIR) / "company" / "logo"
    directory.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    file_path = directory / filename
    file_path.write_bytes(file.file.read())

    return f"company/logo/{filename}"


@router.get("")
def company_profile(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = db.query(Company).first()

    return request.app.state.templates.TemplateResponse(
        "admin/company/profile.html",
        {
            "request": request,
            "current_user": current_user,
            "company": company,
        },
    )


@router.get("/edit")
def company_edit_page(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = db.query(Company).first()

    return request.app.state.templates.TemplateResponse(
        "admin/company/edit.html",
        {
            "request": request,
            "current_user": current_user,
            "company": company,
        },
    )


@router.post("/edit")
def company_update(
    name: str = Form(...),
    website: str = Form(""),
    about: str = Form(""),
    contact_number: str = Form(""),
    contact_email: str = Form(""),
    corporate_address: str = Form(""),
    ceo_name: str = Form(""),
    founder_name: str = Form(""),
    mission: str = Form(""),
    vision: str = Form(""),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = db.query(Company).first()

    if not company:
        company = Company(name=name.strip())
        db.add(company)
        db.flush()

    company.name = name.strip()
    company.website = website.strip() or None
    company.about = about.strip() or None
    company.contact_number = contact_number.strip() or None
    company.contact_email = contact_email.strip() or None
    company.corporate_address = corporate_address.strip() or None
    company.ceo_name = ceo_name.strip() or None
    company.founder_name = founder_name.strip() or None
    company.mission = mission.strip() or None
    company.vision = vision.strip() or None

    logo_path = _save_company_logo(logo)
    if logo_path:
        company.logo = f"/uploads/{logo_path}"

    db.commit()

    return RedirectResponse(
        "/admin/company",
        status_code=303,
    )
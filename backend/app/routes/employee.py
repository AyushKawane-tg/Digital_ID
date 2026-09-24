from datetime import datetime, date
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
from app.core.dependencies import get_db, require_employee
from app.database.models import Employee, User


router = APIRouter(
    prefix="/employee",
    tags=["Employee"],
)


IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _save_employee_picture(file: UploadFile) -> str | None:
    """Save an uploaded picture and return a path relative to the
    /uploads mount (e.g. 'employees/x.png')."""
    if not file or not file.filename:
        return None

    extension = IMAGE_EXTENSIONS.get(file.content_type)
    if not extension:
        return None

    directory = Path(settings.UPLOAD_DIR) / "employees"
    directory.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    (directory / filename).write_bytes(file.file.read())

    return f"employees/{filename}"


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


@router.get("/dashboard")
def employee_dashboard(
    request: Request,
    current_user: User = Depends(require_employee),
):
    employee = current_user.employee

    return request.app.state.templates.TemplateResponse(
        "employee/dashboard.html",
        {
            "request": request,
            "current_user": current_user,
            "employee": employee,
        },
    )


@router.get("/profile")
def employee_profile(
    request: Request,
    current_user: User = Depends(require_employee),
):
    employee = current_user.employee

    return request.app.state.templates.TemplateResponse(
        "employee/profile.html",
        {
            "request": request,
            "current_user": current_user,
            "employee": employee,
        },
    )


@router.get("/profile/edit")
def employee_profile_edit_page(
    request: Request,
    current_user: User = Depends(require_employee),
):
    employee = current_user.employee

    return request.app.state.templates.TemplateResponse(
        "employee/edit_profile.html",
        {
            "request": request,
            "current_user": current_user,
            "employee": employee,
        },
    )


@router.get("/digital-card")
def employee_digital_card(
    request: Request,
    current_user: User = Depends(require_employee),
):
    employee = current_user.employee

    return request.app.state.templates.TemplateResponse(
        "employee/digital_card.html",
        {
            "request": request,
            "current_user": current_user,
            "employee": employee,
            "company": employee.company if employee else None,
        },
    )


@router.put("/profile")
def employee_update_own_profile(
    full_name: str = Form(...),
    designation: str = Form(...),
    department: str = Form(...),
    official_email: str = Form(...),
    contact_number: str = Form(...),
    emergency_contact: str = Form(""),
    office_location: str = Form(...),
    linkedin_url: str = Form(...),
    instagram_url: str = Form(""),
    facebook_url: str = Form(""),
    blood_group: str = Form(""),
    date_of_birth: str = Form(""),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """Employee self-service update of their own personal details.

    Access is limited to the logged-in employee's own record. After
    saving, the QR code / digital card URL is regenerated so the card
    (and the admin panel, which reads the same record) always shows the
    latest information.
    """
    employee = current_user.employee

    if not employee:
        return {
            "status": "error",
            "detail": "No employee record linked to this account.",
        }

    employee.full_name = full_name.strip()
    employee.designation = designation.strip()
    employee.department = department.strip()
    employee.official_email = official_email.strip()
    employee.contact_number = contact_number.strip()
    employee.emergency_contact = emergency_contact.strip() or None
    employee.office_location = office_location.strip()
    employee.linkedin_url = linkedin_url.strip()
    employee.instagram_url = instagram_url.strip() or None
    employee.facebook_url = facebook_url.strip() or None
    employee.blood_group = blood_group.strip() or None

    parsed_dob = _parse_date(date_of_birth)
    if parsed_dob:
        employee.date_of_birth = parsed_dob

    new_picture = _save_employee_picture(picture)
    if new_picture:
        employee.picture = new_picture

    # Regenerate the QR / digital card so it reflects the update.
    try:
        from app.services.qr_service import generate_qr_code

        card_url, qr_path = generate_qr_code(employee.employee_id)
        employee.digital_card_url = card_url
        employee.qr_code_path = qr_path
    except Exception:
        pass

    db.commit()
    db.refresh(employee)

    return {
        "status": "success",
        "message": "Profile updated successfully.",
    }

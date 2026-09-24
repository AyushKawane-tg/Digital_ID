from datetime import date, datetime
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
from app.database.models import Employee, Company, User
from app.services.qr_service import (
    generate_qr_code,
    generate_qr_code_with_base,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _save_employee_picture(file: UploadFile) -> str | None:
    """Save an uploaded employee picture and return the
    path relative to the uploads mount (e.g. 'employees/x.png')."""

    if not file or not file.filename:
        return None

    extension = IMAGE_EXTENSIONS.get(file.content_type)

    if not extension:
        return None

    directory = Path(settings.UPLOAD_DIR) / "employees"
    directory.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    file_path = directory / filename

    file_path.write_bytes(file.file.read())

    return f"employees/{filename}"


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def _get_company(db: Session) -> Company | None:
    return db.query(Company).first()


# ---------------------------------------------------------
# Dashboard & list
# ---------------------------------------------------------

@router.get("/dashboard")
def admin_dashboard(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    employee_count = db.query(Employee).count()
    company_count = db.query(Company).count()

    return request.app.state.templates.TemplateResponse(
        "admin/dashboard.html",
        {
            "request": request,
            "current_user": current_user,
            "employee_count": employee_count,
            "company_count": company_count,
        },
    )


@router.get("/employees")
def employees_page(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    employees = (
        db.query(Employee)
        .order_by(Employee.full_name.asc())
        .all()
    )

    return request.app.state.templates.TemplateResponse(
        "admin/employees/list.html",
        {
            "request": request,
            "current_user": current_user,
            "employees": employees,
        },
    )


# ---------------------------------------------------------
# Employee: Import page
# ---------------------------------------------------------

@router.get("/employees/import")
def employee_import_page(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    from app.database.models import ImportJob

    jobs = (
        db.query(ImportJob)
        .order_by(ImportJob.created_at.desc())
        .all()
    )

    # Split "original|stored" into a display name for the template.
    import_files = []
    for j in jobs:
        original = j.file_name.split("|", 1)[0]
        import_files.append(
            {
                "id": j.id,
                "name": original,
                "total": j.total_rows,
                "successful": j.successful_rows,
                "failed": j.failed_rows,
                "status": j.status,
                "created_at": j.created_at,
            }
        )

    return request.app.state.templates.TemplateResponse(
        "admin/employees/import.html",
        {
            "request": request,
            "current_user": current_user,
            "import_files": import_files,
        },
    )


# ---------------------------------------------------------
# Employee: Add
# ---------------------------------------------------------

@router.get("/employees/add")
def employee_add_page(
    request: Request,
    current_user: User = Depends(require_admin),
):
    return request.app.state.templates.TemplateResponse(
        "admin/employees/add.html",
        {
            "request": request,
            "current_user": current_user,
        },
    )


@router.post("/employees")
def employee_create(
    request: Request,
    employee_id: str = Form(...),
    full_name: str = Form(...),
    designation: str = Form(...),
    department: str = Form(...),
    official_email: str = Form(...),
    contact_number: str = Form(...),
    emergency_contact: str = Form(...),
    office_location: str = Form(...),
    linkedin_url: str = Form(...),
    instagram_url: str = Form(""),
    facebook_url: str = Form(""),
    blood_group: str = Form(""),
    date_of_birth: str = Form(""),
    date_of_joining: str = Form(""),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = _get_company(db)

    if not company:
        company = Company(name="TeleGlobal International")
        db.add(company)
        db.flush()

    picture_path = _save_employee_picture(picture)

    employee = Employee(
        company_id=company.id,
        employee_id=employee_id.strip(),
        full_name=full_name.strip(),
        designation=designation.strip(),
        department=department.strip(),
        official_email=official_email.strip(),
        contact_number=contact_number.strip(),
        emergency_contact=emergency_contact.strip(),
        office_location=office_location.strip(),
        linkedin_url=linkedin_url.strip(),
        instagram_url=instagram_url.strip() or None,
        facebook_url=facebook_url.strip() or None,
        blood_group=blood_group.strip() or None,
        date_of_birth=_parse_date(date_of_birth),
        date_of_joining=_parse_date(date_of_joining),
        picture=picture_path,
    )

    db.add(employee)
    db.flush()

    # Generate the digital card + QR code using the fixed CARD_BASE_URL
    # from .env (e.g. http://10.11.12.174:8000). This keeps every QR
    # pointing at one known, reachable address instead of whatever host
    # the admin request happened to arrive through.
    card_url, qr_path = generate_qr_code(employee.employee_id)
    employee.digital_card_url = card_url
    employee.qr_code_path = qr_path

    db.commit()

    return RedirectResponse(
        f"/admin/employees/{employee.id}",
        status_code=303,
    )


# ---------------------------------------------------------
# Employee: View
# ---------------------------------------------------------

@router.get("/employees/{employee_db_id}")
def employee_view(
    employee_db_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_db_id)
        .first()
    )

    if not employee:
        return RedirectResponse(
            "/admin/employees",
            status_code=303,
        )

    return request.app.state.templates.TemplateResponse(
        "admin/employees/view.html",
        {
            "request": request,
            "current_user": current_user,
            "employee": employee,
        },
    )


# ---------------------------------------------------------
# Employee: Edit
# ---------------------------------------------------------

@router.get("/employees/{employee_db_id}/edit")
def employee_edit_page(
    employee_db_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_db_id)
        .first()
    )

    if not employee:
        return RedirectResponse(
            "/admin/employees",
            status_code=303,
        )

    return request.app.state.templates.TemplateResponse(
        "admin/employees/edit.html",
        {
            "request": request,
            "current_user": current_user,
            "employee": employee,
        },
    )


@router.post("/employees/{employee_db_id}/edit")
def employee_update(
    employee_db_id: int,
    full_name: str = Form(...),
    designation: str = Form(...),
    department: str = Form(...),
    official_email: str = Form(...),
    contact_number: str = Form(...),
    emergency_contact: str = Form(...),
    office_location: str = Form(...),
    linkedin_url: str = Form(...),
    instagram_url: str = Form(""),
    facebook_url: str = Form(""),
    blood_group: str = Form(""),
    date_of_birth: str = Form(""),
    date_of_joining: str = Form(""),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_db_id)
        .first()
    )

    if not employee:
        return RedirectResponse(
            "/admin/employees",
            status_code=303,
        )

    employee.full_name = full_name.strip()
    employee.designation = designation.strip()
    employee.department = department.strip()
    employee.official_email = official_email.strip()
    employee.contact_number = contact_number.strip()
    employee.emergency_contact = emergency_contact.strip()
    employee.office_location = office_location.strip()
    employee.linkedin_url = linkedin_url.strip()
    employee.instagram_url = instagram_url.strip() or None
    employee.facebook_url = facebook_url.strip() or None
    employee.blood_group = blood_group.strip() or None

    parsed_dob = _parse_date(date_of_birth)
    if parsed_dob:
        employee.date_of_birth = parsed_dob

    parsed_doj = _parse_date(date_of_joining)
    if parsed_doj:
        employee.date_of_joining = parsed_doj

    new_picture = _save_employee_picture(picture)
    if new_picture:
        employee.picture = new_picture

    db.commit()

    return RedirectResponse(
        f"/admin/employees/{employee.id}",
        status_code=303,
    )


# ---------------------------------------------------------
# Employee: QR code page
# ---------------------------------------------------------

@router.get("/employees/{employee_db_id}/qr")
def employee_qr_page(
    employee_db_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_db_id
        )
        .first()
    )

    if not employee:

        return RedirectResponse(
            "/admin/employees",
            status_code=303,
        )

    # -----------------------------------------------------
    # Always make sure the QR uses the CURRENT
    # CARD_BASE_URL.
    # -----------------------------------------------------

    current_card_url = (
        f"{settings.CARD_BASE_URL.rstrip('/')}"
        f"/card/{employee.employee_id}"
    )

    # -----------------------------------------------------
    # Regenerate when:
    #
    # 1. QR doesn't exist
    # 2. Digital URL doesn't exist
    # 3. Existing URL is different from current URL
    # -----------------------------------------------------

    qr_missing = (
        not employee.qr_code_path
        or not Path(employee.qr_code_path).exists()
    )

    url_changed = (
        employee.digital_card_url
        != current_card_url
    )

    if qr_missing or url_changed:

        card_url, qr_path = (
            generate_qr_code(
                employee.employee_id
            )
        )

        employee.digital_card_url = card_url
        employee.qr_code_path = qr_path

        db.commit()

        db.refresh(employee)

    return request.app.state.templates.TemplateResponse(
        "admin/employees/qr.html",
        {
            "request": request,
            "current_user": current_user,
            "employee": employee,
        },
    )
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_db_id)
        .first()
    )

    if not employee:
        return RedirectResponse(
            "/admin/employees",
            status_code=303,
        )

    # Ensure the QR code exists.
    if not employee.qr_code_path:
        card_url, qr_path = generate_qr_code(employee.employee_id)
        employee.digital_card_url = card_url
        employee.qr_code_path = qr_path
        db.commit()

    return request.app.state.templates.TemplateResponse(
        "admin/employees/qr.html",
        {
            "request": request,
            "current_user": current_user,
            "employee": employee,
        },
    )


# ---------------------------------------------------------
# Employee: Delete
# ---------------------------------------------------------

@router.post("/employees/{employee_db_id}/delete")
def employee_delete(
    employee_db_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_db_id)
        .first()
    )

    if not employee:
        return RedirectResponse(
            "/admin/employees",
            status_code=303,
        )

    # Clean up the generated QR code file.
    if employee.qr_code_path:
        try:
            qr_file = Path(employee.qr_code_path)
            if not qr_file.exists():
                qr_file = (
                    Path(settings.QR_CODE_DIR)
                    / Path(employee.qr_code_path).name
                )
            if qr_file.exists():
                qr_file.unlink()
        except Exception:
            pass

    # Clean up the uploaded picture file.
    if employee.picture:
        try:
            picture_file = Path(settings.UPLOAD_DIR) / employee.picture
            if picture_file.exists():
                picture_file.unlink()
        except Exception:
            pass

    # Remove the linked employee login account, if any.
    if employee.user_id:
        linked_user = (
            db.query(User)
            .filter(User.id == employee.user_id)
            .first()
        )
        if linked_user and linked_user.role == "EMPLOYEE":
            db.delete(linked_user)

    db.delete(employee)
    db.commit()

    return RedirectResponse(
        "/admin/employees",
        status_code=303,
    )

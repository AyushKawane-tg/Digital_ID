from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_db, require_admin
from app.database.models import Company, Employee, ImportJob, User
from app.services.excel_import_service import (
    import_employees_from_excel,
)


router = APIRouter(
    prefix="/api/admin/import",
    tags=["Employee Import"],
)


def _stored_dir() -> Path:
    directory = Path(settings.UPLOAD_DIR) / "imports"
    directory.mkdir(parents=True, exist_ok=True)
    return directory


@router.post("/employees")
async def import_employees(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if not file.filename:
        return {"status": "error", "message": "No file selected"}

    if not file.filename.lower().endswith((".xlsx", ".xls")):
        return {"status": "error", "message": "Only Excel files are allowed"}

    # Persist the upload to disk.
    directory = _stored_dir()
    extension = Path(file.filename).suffix.lower()
    stored_name = f"{uuid4().hex}{extension}"
    saved_path = directory / stored_name
    saved_path.write_bytes(await file.read())

    # Resolve the company to attach imported employees to.
    company = db.query(Company).first()
    if not company:
        company = Company(name="TeleGlobal International")
        db.add(company)
        db.flush()
        db.commit()

    # Create the import job FIRST so imported employees can be tagged
    # with it (needed to remove them if the file is later deleted).
    job = ImportJob(
        file_name=f"{file.filename}|{stored_name}",
        uploaded_by=current_user.id,
        total_rows=0,
        successful_rows=0,
        failed_rows=0,
        status="PENDING",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    try:
        result = import_employees_from_excel(
            db=db,
            file_path=str(saved_path),
            company_id=company.id,
            import_job_id=job.id,
        )
    except ValueError as exc:
        job.status = "FAILED"
        job.error_report = str(exc)
        db.commit()
        return {"status": "error", "message": str(exc)}
    except Exception as exc:  # noqa: BLE001
        job.status = "FAILED"
        job.error_report = str(exc)
        db.commit()
        return {"status": "error", "message": f"Import failed: {exc}"}

    # Update the job with the final results.
    job.total_rows = result["total_rows"]
    job.successful_rows = result["successful_rows"]
    job.failed_rows = result["failed_rows"]
    job.status = result["status"].upper()
    db.commit()

    result["filename"] = file.filename
    result["message"] = (
        f"Imported {result['successful_rows']} of "
        f"{result['total_rows']} employees."
    )
    return result


@router.post("/jobs/{job_id}/delete")
def delete_import_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete an uploaded Excel file: removes the stored file, the
    import-job record, AND every employee (with QR/photo) that was
    imported from that file."""
    job = (
        db.query(ImportJob)
        .filter(ImportJob.id == job_id)
        .first()
    )

    if not job:
        return RedirectResponse("/admin/employees/import", status_code=303)

    # 1) Delete employees created by this import (and their files).
    employees = (
        db.query(Employee)
        .filter(Employee.import_job_id == job.id)
        .all()
    )

    for emp in employees:
        # Remove QR file.
        if emp.qr_code_path:
            try:
                qr = Path(emp.qr_code_path)
                if not qr.exists():
                    qr = Path(settings.QR_CODE_DIR) / Path(emp.qr_code_path).name
                if qr.exists():
                    qr.unlink()
            except Exception:
                pass
        # Remove picture file.
        if emp.picture:
            try:
                pic = Path(settings.UPLOAD_DIR) / emp.picture
                if pic.exists():
                    pic.unlink()
            except Exception:
                pass
        # Remove a linked employee login, if any.
        if emp.user_id:
            linked = (
                db.query(User).filter(User.id == emp.user_id).first()
            )
            if linked and linked.role == "EMPLOYEE":
                db.delete(linked)
        db.delete(emp)

    # 2) Delete the stored .xlsx file.
    try:
        stored = job.file_name.split("|", 1)[-1]
        f = _stored_dir() / stored
        if f.exists():
            f.unlink()
    except Exception:
        pass

    # 3) Delete the job record.
    db.delete(job)
    db.commit()

    return RedirectResponse("/admin/employees/import", status_code=303)

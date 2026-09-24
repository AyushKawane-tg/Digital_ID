from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    Request,
    UploadFile,
    File,
)
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_db, require_admin
from app.database.models import Company, User


router = APIRouter(
    prefix="/admin/company-deck",
    tags=["Company Deck"],
)


@router.post("/upload")
async def upload_company_deck(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = db.query(Company).first()

    if not company:
        return RedirectResponse(
            "/admin/company-deck",
            status_code=303,
        )

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return RedirectResponse(
            "/admin/company-deck",
            status_code=303,
        )

    directory = Path(settings.UPLOAD_DIR) / "decks"
    directory.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}.pdf"
    file_path = directory / filename
    file_path.write_bytes(await file.read())

    company.company_deck = f"decks/{filename}"
    db.commit()

    return RedirectResponse(
        "/admin/company-deck",
        status_code=303,
    )


@router.get("")
def company_deck_page(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = db.query(Company).first()

    return request.app.state.templates.TemplateResponse(
        "admin/company_deck/index.html",
        {
            "request": request,
            "current_user": current_user,
            "company": company,
        },
    )


@router.get("/download")
def download_company_deck(
    db: Session = Depends(get_db),
):
    company = db.query(Company).first()

    if not company or not company.company_deck:
        return {
            "error": "Company deck not available"
        }

    file_path = Path(settings.UPLOAD_DIR) / company.company_deck

    if not file_path.exists():
        return {
            "error": "Company deck file not found"
        }

    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/pdf",
    )
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.database import SessionLocal
from app.database.models import Employee
from app.services.qr_service import (
    build_card_url,
    generate_qr_code,
)


router = APIRouter(
    tags=["Digital Card"],
)


# ---------------------------------------------------------
# Helper
# ---------------------------------------------------------

def get_employee(
    db: Session,
    employee_id: str,
) -> Employee | None:

    return (
        db.query(Employee)
        .filter(
            Employee.employee_id == employee_id
        )
        .first()
    )


# ---------------------------------------------------------
# Digital Employee Card
# ---------------------------------------------------------

@router.get("/card/{employee_id}")
def digital_card(
    employee_id: str,
    request: Request,
):

    db = SessionLocal()

    try:

        employee = get_employee(
            db,
            employee_id,
        )

        if not employee:

            return request.app.state.templates.TemplateResponse(
                "card/404.html",
                {
                    "request": request,
                    "employee_id": employee_id,
                },
                status_code=404,
            )

        company = employee.company

        return request.app.state.templates.TemplateResponse(
            "card/digital_card.html",
            {
                "request": request,
                "employee": employee,
                "company": company,
                "badges": (
                    company.badges
                    if company
                    else []
                ),
                "locations": (
                    company.locations
                    if company
                    else []
                ),
            },
        )

    finally:

        db.close()


# ---------------------------------------------------------
# Front side
# ---------------------------------------------------------

@router.get("/card/{employee_id}/front")
def digital_card_front(
    employee_id: str,
    request: Request,
):

    db = SessionLocal()

    try:

        employee = get_employee(
            db,
            employee_id,
        )

        if not employee:

            return request.app.state.templates.TemplateResponse(
                "card/404.html",
                {
                    "request": request,
                    "employee_id": employee_id,
                },
                status_code=404,
            )

        return request.app.state.templates.TemplateResponse(
            "card/front.html",
            {
                "request": request,
                "employee": employee,
                "company": employee.company,
            },
        )

    finally:

        db.close()


# ---------------------------------------------------------
# Back side
# ---------------------------------------------------------

@router.get("/card/{employee_id}/back")
def digital_card_back(
    employee_id: str,
    request: Request,
):

    db = SessionLocal()

    try:

        employee = get_employee(
            db,
            employee_id,
        )

        if not employee:

            return request.app.state.templates.TemplateResponse(
                "card/404.html",
                {
                    "request": request,
                    "employee_id": employee_id,
                },
                status_code=404,
            )

        return request.app.state.templates.TemplateResponse(
            "card/back.html",
            {
                "request": request,
                "employee": employee,
                "company": employee.company,
            },
        )

    finally:

        db.close()


# ---------------------------------------------------------
# Company deck
# ---------------------------------------------------------

@router.get("/card/{employee_id}/company-deck")
def download_card_company_deck(
    employee_id: str,
):

    db = SessionLocal()

    try:

        employee = get_employee(
            db,
            employee_id,
        )

        if not employee or not employee.company:

            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        company = employee.company

        if not company.company_deck:

            raise HTTPException(
                status_code=404,
                detail="Company deck not available",
            )

        deck_path = (
            Path(settings.UPLOAD_DIR)
            / company.company_deck
        )

        if not deck_path.exists():

            raise HTTPException(
                status_code=404,
                detail="Company deck file not found",
            )

        return FileResponse(
            path=deck_path,
            filename=deck_path.name,
            media_type="application/pdf",
        )

    finally:

        db.close()


# ---------------------------------------------------------
# Employee QR
# ---------------------------------------------------------

@router.get("/card/{employee_id}/qr")
def employee_qr(
    employee_id: str,
):

    db = SessionLocal()

    try:

        employee = get_employee(
            db,
            employee_id,
        )

        if not employee:

            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        # If QR does not exist, generate it.
        if not employee.qr_code_path:

            card_url, qr_path = (
                generate_qr_code(
                    employee.employee_id
                )
            )

            employee.digital_card_url = card_url
            employee.qr_code_path = qr_path

            db.commit()

        qr_path = Path(
            employee.qr_code_path
        )

        # Handle old relative paths.
        if not qr_path.exists():

            qr_path = (
                Path(settings.QR_CODE_DIR)
                / qr_path.name
            )

        if not qr_path.exists():

            raise HTTPException(
                status_code=404,
                detail="QR code file not found",
            )

        return FileResponse(
            path=qr_path,
            media_type="image/png",
            filename=(
                f"{employee.employee_id}.png"
            ),
        )

    finally:

        db.close()


# ---------------------------------------------------------
# Download QR
# ---------------------------------------------------------

@router.get("/card/{employee_id}/qr/download")
def download_employee_qr(
    employee_id: str,
):

    db = SessionLocal()

    try:

        employee = get_employee(
            db,
            employee_id,
        )

        if not employee:

            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        if not employee.qr_code_path:

            card_url, qr_path = (
                generate_qr_code(
                    employee.employee_id
                )
            )

            employee.digital_card_url = card_url
            employee.qr_code_path = qr_path

            db.commit()

        qr_path = Path(
            employee.qr_code_path
        )

        if not qr_path.exists():

            qr_path = (
                Path(settings.QR_CODE_DIR)
                / qr_path.name
            )

        if not qr_path.exists():

            raise HTTPException(
                status_code=404,
                detail="QR code file not found",
            )

        return FileResponse(
            path=qr_path,
            media_type="image/png",
            filename=(
                f"{employee.employee_id}_QR.png"
            ),
        )

    finally:

        db.close()
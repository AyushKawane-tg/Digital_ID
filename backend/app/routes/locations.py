from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_admin
from app.database.models import Company, CompanyLocation, User


router = APIRouter(
    prefix="/admin/locations",
    tags=["Company Locations"],
)


@router.get("")
def locations_page(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    locations = (
        db.query(CompanyLocation)
        .order_by(CompanyLocation.location_name.asc())
        .all()
    )

    return request.app.state.templates.TemplateResponse(
        "admin/locations/list.html",
        {
            "request": request,
            "current_user": current_user,
            "locations": locations,
        },
    )


@router.get("/add")
def location_add_page(
    request: Request,
    current_user: User = Depends(require_admin),
):
    return request.app.state.templates.TemplateResponse(
        "admin/locations/form.html",
        {
            "request": request,
            "current_user": current_user,
            "location": None,
        },
    )


@router.post("/add")
def location_create(
    location_name: str = Form(...),
    address: str = Form(...),
    contact_number: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    company = db.query(Company).first()

    if not company:
        company = Company(name="TeleGlobal International")
        db.add(company)
        db.flush()

    location = CompanyLocation(
        company_id=company.id,
        location_name=location_name.strip(),
        address=address.strip(),
        contact_number=contact_number.strip() or None,
    )

    db.add(location)
    db.commit()

    return RedirectResponse(
        "/admin/locations",
        status_code=303,
    )


@router.get("/{location_id}/edit")
def location_edit_page(
    location_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    location = (
        db.query(CompanyLocation)
        .filter(CompanyLocation.id == location_id)
        .first()
    )

    if not location:
        return RedirectResponse(
            "/admin/locations",
            status_code=303,
        )

    return request.app.state.templates.TemplateResponse(
        "admin/locations/form.html",
        {
            "request": request,
            "current_user": current_user,
            "location": location,
        },
    )


@router.post("/{location_id}/edit")
def location_update(
    location_id: int,
    location_name: str = Form(...),
    address: str = Form(...),
    contact_number: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    location = (
        db.query(CompanyLocation)
        .filter(CompanyLocation.id == location_id)
        .first()
    )

    if not location:
        return RedirectResponse(
            "/admin/locations",
            status_code=303,
        )

    location.location_name = location_name.strip()
    location.address = address.strip()
    location.contact_number = contact_number.strip() or None

    db.commit()

    return RedirectResponse(
        "/admin/locations",
        status_code=303,
    )
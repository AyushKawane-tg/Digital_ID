from sqlalchemy.orm import Session

from app.database.models import CompanyLocation
from app.schemas.location import (
    LocationCreate,
    LocationUpdate,
)


def get_location(
    db: Session,
    location_id: int,
) -> CompanyLocation | None:

    return (
        db.query(CompanyLocation)
        .filter(
            CompanyLocation.id == location_id
        )
        .first()
    )


def get_company_locations(
    db: Session,
    company_id: int,
) -> list[CompanyLocation]:

    return (
        db.query(CompanyLocation)
        .filter(
            CompanyLocation.company_id == company_id
        )
        .order_by(
            CompanyLocation.location_name.asc()
        )
        .all()
    )


def create_location(
    db: Session,
    data: LocationCreate,
) -> CompanyLocation:

    location = CompanyLocation(
        company_id=data.company_id,
        location_name=data.location_name,
        address=data.address,
        contact_number=data.contact_number,
    )

    db.add(location)
    db.commit()
    db.refresh(location)

    return location


def update_location(
    db: Session,
    location: CompanyLocation,
    data: LocationUpdate,
) -> CompanyLocation:

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(location, field, value)

    db.commit()
    db.refresh(location)

    return location


def delete_location(
    db: Session,
    location: CompanyLocation,
) -> None:

    db.delete(location)
    db.commit()
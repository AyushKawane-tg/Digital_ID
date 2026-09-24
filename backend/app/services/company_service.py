from sqlalchemy.orm import Session

from app.database.models import Company
from app.schemas.company import (
    CompanyCreate,
    CompanyUpdate,
)


def get_company(
    db: Session,
    company_id: int | None = None,
) -> Company | None:

    query = db.query(Company)

    if company_id:
        return (
            query
            .filter(Company.id == company_id)
            .first()
        )

    return query.first()


def create_company(
    db: Session,
    data: CompanyCreate,
) -> Company:

    company = Company(
        name=data.name,
        about=data.about,
        website=(
            str(data.website)
            if data.website
            else None
        ),
        corporate_address=data.corporate_address,
        contact_number=data.contact_number,
        contact_email=(
            str(data.contact_email)
            if data.contact_email
            else None
        ),
        ceo_name=data.ceo_name,
        founder_name=data.founder_name,
        mission=data.mission,
        vision=data.vision,
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return company


def update_company(
    db: Session,
    company: Company,
    data: CompanyUpdate,
) -> Company:

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        if value is not None and field in {
            "website",
            "contact_email",
        }:
            value = str(value)

        setattr(company, field, value)

    db.commit()
    db.refresh(company)

    return company
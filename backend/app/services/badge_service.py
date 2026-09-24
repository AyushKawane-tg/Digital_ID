from sqlalchemy.orm import Session

from app.database.models import CompanyBadge
from app.schemas.badge import (
    BadgeCreate,
    BadgeUpdate,
)


def get_badge(
    db: Session,
    badge_id: int,
) -> CompanyBadge | None:

    return (
        db.query(CompanyBadge)
        .filter(
            CompanyBadge.id == badge_id
        )
        .first()
    )


def get_company_badges(
    db: Session,
    company_id: int,
) -> list[CompanyBadge]:

    return (
        db.query(CompanyBadge)
        .filter(
            CompanyBadge.company_id == company_id
        )
        .order_by(
            CompanyBadge.created_at.desc()
        )
        .all()
    )


def create_badge(
    db: Session,
    data: BadgeCreate,
) -> CompanyBadge:

    badge = CompanyBadge(
        company_id=data.company_id,
        title=data.title,
        description=data.description,
    )

    db.add(badge)
    db.commit()
    db.refresh(badge)

    return badge


def update_badge(
    db: Session,
    badge: CompanyBadge,
    data: BadgeUpdate,
) -> CompanyBadge:

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(badge, field, value)

    db.commit()
    db.refresh(badge)

    return badge


def delete_badge(
    db: Session,
    badge: CompanyBadge,
) -> None:

    db.delete(badge)
    db.commit()
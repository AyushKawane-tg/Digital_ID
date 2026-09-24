from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import Employee
from app.services.qr_service import generate_qr_code


def generate_digital_card(
    db: Session,
    employee: Employee,
) -> Employee:

    card_url, qr_path = generate_qr_code(
        employee.employee_id
    )

    employee.digital_card_url = card_url
    employee.qr_code_path = qr_path

    db.commit()
    db.refresh(employee)

    return employee


def get_digital_card(
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


def regenerate_employee_qr(
    db: Session,
    employee: Employee,
) -> Employee:

    card_url, qr_path = generate_qr_code(
        employee.employee_id
    )

    employee.digital_card_url = card_url
    employee.qr_code_path = qr_path

    db.commit()
    db.refresh(employee)

    return employee
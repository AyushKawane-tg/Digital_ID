from sqlalchemy.orm import Session

from app.database.models import Employee
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
)


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


def get_employee_by_id(
    db: Session,
    employee_db_id: int,
) -> Employee | None:

    return (
        db.query(Employee)
        .filter(Employee.id == employee_db_id)
        .first()
    )


def get_all_employees(
    db: Session,
) -> list[Employee]:

    return (
        db.query(Employee)
        .order_by(Employee.full_name.asc())
        .all()
    )


def create_employee(
    db: Session,
    data: EmployeeCreate,
) -> Employee:

    employee = Employee(
        company_id=data.company_id,
        employee_id=data.employee_id,
        full_name=data.full_name,
        designation=data.designation,
        department=data.department,
        official_email=str(data.official_email),
        contact_number=data.contact_number,
        emergency_contact=data.emergency_contact,
        office_location=data.office_location,
        linkedin_url=str(data.linkedin_url),
        instagram_url=(
            str(data.instagram_url)
            if data.instagram_url
            else None
        ),
        facebook_url=(
            str(data.facebook_url)
            if data.facebook_url
            else None
        ),
        blood_group=data.blood_group,
        date_of_birth=data.date_of_birth,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


def update_employee(
    db: Session,
    employee: Employee,
    data: EmployeeUpdate,
) -> Employee:

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        if value is not None and field in {
            "linkedin_url",
            "instagram_url",
            "facebook_url",
            "official_email",
        }:
            value = str(value)

        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


def delete_employee(
    db: Session,
    employee: Employee,
) -> None:

    db.delete(employee)
    db.commit()
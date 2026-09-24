from datetime import datetime
from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import Employee
from app.services.qr_service import generate_qr_code


REQUIRED_COLUMNS = {
    "employee_id",
    "full_name",
    "designation",
    "department",
    "official_email",
    "contact_number",
    "emergency_contact",
    "office_location",
    "linkedin_url",
    "date_of_birth",
}


OPTIONAL_COLUMNS = {
    "instagram_url",
    "facebook_url",
    "blood_group",
}


def normalize_column(column: str) -> str:

    return (
        str(column)
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
    )


def parse_date(value):

    if pd.isna(value):
        return None

    if isinstance(value, datetime):
        return value.date()

    try:
        return pd.to_datetime(value).date()
    except Exception:
        return None


def import_employees_from_excel(
    db: Session,
    file_path: str,
    company_id: int,
    import_job_id: int | None = None,
):

    df = pd.read_excel(file_path)

    df.columns = [
        normalize_column(column)
        for column in df.columns
    ]

    missing_columns = (
        REQUIRED_COLUMNS - set(df.columns)
    )

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            + ", ".join(
                sorted(missing_columns)
            )
        )

    total_rows = len(df)
    successful_rows = 0
    failed_rows = 0
    errors = []

    for index, row in df.iterrows():

        excel_row = index + 2

        try:

            employee_id = str(
                row["employee_id"]
            ).strip()

            if not employee_id:
                raise ValueError(
                    "Employee ID is required."
                )

            existing = (
                db.query(Employee)
                .filter(
                    Employee.employee_id
                    == employee_id
                )
                .first()
            )

            if existing:
                raise ValueError(
                    f"Employee ID '{employee_id}' "
                    "already exists."
                )

            linkedin_url = str(
                row["linkedin_url"]
            ).strip()

            if not linkedin_url or linkedin_url.lower() == "nan":
                raise ValueError(
                    "LinkedIn URL is required."
                )

            date_of_birth = parse_date(
                row["date_of_birth"]
            )

            if not date_of_birth:
                raise ValueError(
                    "Invalid date of birth."
                )

            employee = Employee(
                company_id=company_id,
                employee_id=employee_id,
                full_name=str(
                    row["full_name"]
                ).strip(),
                designation=str(
                    row["designation"]
                ).strip(),
                department=str(
                    row["department"]
                ).strip(),
                official_email=str(
                    row["official_email"]
                ).strip(),
                contact_number=str(
                    row["contact_number"]
                ).strip(),
                emergency_contact=str(
                    row["emergency_contact"]
                ).strip(),
                office_location=str(
                    row["office_location"]
                ).strip(),
                linkedin_url=linkedin_url,
                instagram_url=(
                    None
                    if pd.isna(
                        row.get("instagram_url")
                    )
                    else str(
                        row["instagram_url"]
                    ).strip()
                ),
                facebook_url=(
                    None
                    if pd.isna(
                        row.get("facebook_url")
                    )
                    else str(
                        row["facebook_url"]
                    ).strip()
                ),
                blood_group=(
                    None
                    if pd.isna(
                        row.get("blood_group")
                    )
                    else str(
                        row["blood_group"]
                    ).strip()
                ),
                date_of_birth=date_of_birth,
                import_job_id=import_job_id,
            )

            db.add(employee)
            db.flush()

            card_url, qr_path = generate_qr_code(
                employee_id
            )

            employee.digital_card_url = card_url
            employee.qr_code_path = qr_path

            successful_rows += 1

        except Exception as exc:

            failed_rows += 1

            errors.append(
                {
                    "row": excel_row,
                    "employee_id": (
                        str(row.get("employee_id"))
                        if "employee_id" in row
                        else None
                    ),
                    "error": str(exc),
                }
            )

    db.commit()

    return {
        "status": (
            "success"
            if failed_rows == 0
            else "partial"
        ),
        "total_rows": total_rows,
        "successful_rows": successful_rows,
        "failed_rows": failed_rows,
        "errors": errors,
    }
from sqlalchemy.orm import Session

from app.database.database import SessionLocal, init_db
from app.database.models import (
    User,
    Company,
    Employee,
    CompanyLocation,
    CompanyBadge,
)
from app.core.security import hash_password
from app.core.config import settings


COMPANY_ABOUT = (
    "TeleGlobal is a trusted global IT solutions partner helping "
    "businesses modernize, scale and secure their operations through "
    "Cloud Services, Remote Infrastructure Management, Data & AI "
    "Solutions and Managed IT Services. Founded in 2016, TeleGlobal has "
    "grown from a cloud advisory firm into a global IT transformation "
    "partner serving 900+ clients across BFSI, healthcare, education, "
    "manufacturing, logistics and more, with a presence across India, "
    "the US, the Middle East and Europe. TeleGlobal brings strong "
    "multi-cloud expertise (AWS, Azure, GCP), 24x7 NOC and SOC "
    "operations, 100+ certified cloud and security professionals and a "
    "dedicated Cloud Center of Excellence."
)

COMPANY_MISSION = (
    "To drive digital transformation by transitioning businesses from "
    "traditional infrastructure to scalable, secure cloud-first "
    "environments, reducing operational complexity, enhancing "
    "cybersecurity and enabling innovation at scale."
)

COMPANY_VISION = (
    "To be a global leader in IT consulting and managed services, "
    "enabling organizations to stay agile, compliant and future-ready "
    "in an ever-changing digital landscape."
)

COMPANY_ADDRESS = (
    "Cerebrum IT Park, B-3, Office No. 4B, "
    "Kalyani Nagar, Pune, Maharashtra - 411014, India"
)


def seed_database():

    init_db()

    db: Session = SessionLocal()

    try:

        # -----------------------------
        # ADMIN
        # -----------------------------

        admin = (
            db.query(User)
            .filter(User.email == "admin@teleglobals.com")
            .first()
        )

        if not admin:

            admin = User(
                email="admin@teleglobals.com",
                password_hash=hash_password("Admin@123"),
                role="ADMIN",
                is_active=True,
            )

            db.add(admin)

        # -----------------------------
        # COMPANY
        # -----------------------------

        company = (
            db.query(Company)
            .filter(
                Company.name.in_(
                    [
                        "TeleGlobal",
                        "TeleGlobal International",
                        "TeleGlobal International Pvt. Ltd.",
                    ]
                )
            )
            .first()
        )

        if not company:

            company = Company(
                name="TeleGlobal International Pvt. Ltd.",
                logo="/static/images/logo/teleglobal-logo.png",
                about=COMPANY_ABOUT,
                website="https://teleglobals.com/",
                corporate_address=COMPANY_ADDRESS,
                contact_number="+91 20 6900 0000",
                contact_email="info@teleglobals.com",
                ceo_name="Ashish Kumar (CEO & Founder)",
                founder_name="Ashish Kumar",
                mission=COMPANY_MISSION,
                vision=COMPANY_VISION,
            )

            db.add(company)
            db.flush()

        else:

            # Refresh existing company with the real
            # TeleGlobal profile information.
            company.name = "TeleGlobal International Pvt. Ltd."
            company.about = COMPANY_ABOUT
            company.website = "https://teleglobals.com/"
            company.corporate_address = COMPANY_ADDRESS
            company.contact_number = "+91 20 6900 0000"
            company.contact_email = "info@teleglobals.com"
            company.ceo_name = "Ashish Kumar (CEO & Founder)"
            company.founder_name = "Ashish Kumar"
            company.mission = COMPANY_MISSION
            company.vision = COMPANY_VISION
            db.flush()

        # -----------------------------
        # OFFICE LOCATIONS
        # -----------------------------

        seed_locations = [
            {
                "location_name": "India - Head Office (Pune)",
                "address": (
                    "Cerebrum IT Park, B-3, Office No. 4B, "
                    "Kalyani Nagar, Pune, Maharashtra - 411014, India"
                ),
                "contact_number": "+91 20 6900 0000",
            },
            {
                "location_name": "United States",
                "address": "United States of America",
                "contact_number": None,
            },
            {
                "location_name": "Europe",
                "address": "Europe",
                "contact_number": None,
            },
            {
                "location_name": "UAE - Middle East",
                "address": "United Arab Emirates",
                "contact_number": None,
            },
        ]

        for loc in seed_locations:
            exists = (
                db.query(CompanyLocation)
                .filter(
                    CompanyLocation.company_id == company.id,
                    CompanyLocation.location_name
                    == loc["location_name"],
                )
                .first()
            )
            if not exists:
                db.add(
                    CompanyLocation(
                        company_id=company.id,
                        location_name=loc["location_name"],
                        address=loc["address"],
                        contact_number=loc["contact_number"],
                    )
                )

        db.flush()

        # -----------------------------
        # BADGES & CERTIFICATES
        # -----------------------------

        seed_badges = [
            {
                "title": "AWS AI Competency",
                "description": (
                    "Validated expertise in delivering AI solutions "
                    "on AWS."
                ),
            },
            {
                "title": "AWS Tech Guru Community - 1st Rank (Q2)",
                "description": (
                    "Secured 1st Rank in the AWS Tech Guru Community "
                    "Program Q2."
                ),
            },
            {
                "title": "Multi-Cloud Expertise",
                "description": (
                    "Strong expertise across AWS, Microsoft Azure "
                    "and Google Cloud Platform."
                ),
            },
            {
                "title": "24x7 NOC & SOC Operations",
                "description": (
                    "Round-the-clock Network and Security Operations "
                    "Center services."
                ),
            },
        ]

        for badge in seed_badges:
            exists = (
                db.query(CompanyBadge)
                .filter(
                    CompanyBadge.company_id == company.id,
                    CompanyBadge.title == badge["title"],
                )
                .first()
            )
            if not exists:
                db.add(
                    CompanyBadge(
                        company_id=company.id,
                        title=badge["title"],
                        description=badge["description"],
                    )
                )

        db.flush()

        # -----------------------------
        # REAL EMPLOYEE (linked to employee login)
        # -----------------------------

        from datetime import date as _date

        employee = (
            db.query(Employee)
            .filter(Employee.employee_id == "TG100785")
            .first()
        )

        if not employee:

            employee = Employee(
                company_id=company.id,
                employee_id="TG100785",
                full_name="Ayush Kawane",
                designation="Software Engineer",
                department="Technology",
                official_email="ayush.kawane@teleglobals.com",
                contact_number="+91 90119 22733",
                emergency_contact="+91 90119 22733",
                office_location=(
                    "Cerebrum IT Park, B-3, Office No. 4B, "
                    "Kalyani Nagar, Pune, Maharashtra - 411014"
                ),
                linkedin_url="https://www.linkedin.com/in/ayush-kawane",
                instagram_url=None,
                facebook_url=None,
                blood_group="B+",
                date_of_birth=_date(2002, 1, 1),
                date_of_joining=_date(2026, 7, 28),
                digital_card_url=f"{settings.CARD_BASE_URL}/card/TG100785",
            )

            db.add(employee)
            db.flush()

        # Keep the real employee details in sync on re-seed.
        if not employee.date_of_joining:
            employee.date_of_joining = _date(2026, 7, 28)
        if not employee.blood_group:
            employee.blood_group = "B+"

        # Ensure the employee has a QR code generated.
        if not employee.qr_code_path:
            try:
                from app.services.qr_service import generate_qr_code

                card_url, qr_path = generate_qr_code(
                    employee.employee_id
                )
                employee.digital_card_url = card_url
                employee.qr_code_path = qr_path
            except Exception as qr_error:
                print(f"QR generation skipped: {qr_error}")

        # -----------------------------
        # EMPLOYEE LOGIN (limited access)
        # -----------------------------

        employee_user = (
            db.query(User)
            .filter(
                User.email.in_(
                    [
                        "employee@teleglobals.com",
                        "ayush.kawane@teleglobals.com",
                    ]
                )
            )
            .first()
        )

        if not employee_user:
            employee_user = User(
                email="ayush.kawane@teleglobals.com",
                password_hash=hash_password("Employee@123"),
                role="EMPLOYEE",
                is_active=True,
            )
            db.add(employee_user)
            db.flush()
        else:
            # Align the existing employee login with the real employee.
            employee_user.email = "ayush.kawane@teleglobals.com"
            employee_user.role = "EMPLOYEE"
            employee_user.is_active = True

        # Link the login to the real employee record so the
        # employee can manage only their own details.
        # First detach this user from any other employee to avoid
        # violating the unique user_id constraint.
        previously_linked = (
            db.query(Employee)
            .filter(
                Employee.user_id == employee_user.id,
                Employee.id != employee.id,
            )
            .all()
        )
        for other in previously_linked:
            other.user_id = None
        db.flush()

        if employee.user_id != employee_user.id:
            employee.user_id = employee_user.id

        db.commit()

        print("Database seeded successfully.")
        print("Admin Email: admin@teleglobals.com")
        print("Admin Password: Admin@123")
        print("Employee Email: ayush.kawane@teleglobals.com")
        print("Employee Password: Employee@123")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
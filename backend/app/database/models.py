from datetime import datetime, date

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="EMPLOYEE",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    employee: Mapped["Employee"] = relationship(
        "Employee",
        back_populates="user",
        uselist=False,
    )


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    logo: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    about: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    corporate_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    contact_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    ceo_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    founder_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    mission: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    vision: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    company_deck: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    employees: Mapped[list["Employee"]] = relationship(
        "Employee",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    locations: Mapped[list["CompanyLocation"]] = relationship(
        "CompanyLocation",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    badges: Mapped[list["CompanyBadge"]] = relationship(
        "CompanyBadge",
        back_populates="company",
        cascade="all, delete-orphan",
    )


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=True,
        index=True,
    )

    employee_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    picture: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    designation: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    department: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    official_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    contact_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    emergency_contact: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    office_location: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    linkedin_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    instagram_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    facebook_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    blood_group: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    date_of_birth: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    date_of_joining: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    digital_card_url: Mapped[str | None] = mapped_column(
        String(500),
        unique=True,
        nullable=True,
    )

    qr_code_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Which Excel import created this employee (null if added manually).
    import_job_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="employees",
    )

    user: Mapped["User | None"] = relationship(
        "User",
        back_populates="employee",
    )


class CompanyLocation(Base):
    __tablename__ = "company_locations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    location_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    address: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    contact_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="locations",
    )


class CompanyBadge(Base):
    __tablename__ = "company_badges"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    image_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="badges",
    )


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    uploaded_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    total_rows: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    successful_rows: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    failed_rows: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
    )

    error_report: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
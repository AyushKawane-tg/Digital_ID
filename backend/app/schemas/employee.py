from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl


class EmployeeBase(BaseModel):

    employee_id: str
    full_name: str
    designation: str
    department: str
    official_email: EmailStr
    contact_number: str
    emergency_contact: str
    office_location: str

    linkedin_url: HttpUrl

    instagram_url: Optional[HttpUrl] = None
    facebook_url: Optional[HttpUrl] = None

    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None


class EmployeeCreate(EmployeeBase):
    company_id: int


class EmployeeUpdate(BaseModel):

    full_name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    official_email: Optional[EmailStr] = None
    contact_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    office_location: Optional[str] = None

    linkedin_url: Optional[HttpUrl] = None
    instagram_url: Optional[HttpUrl] = None
    facebook_url: Optional[HttpUrl] = None

    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None


class EmployeeResponse(EmployeeBase):

    id: int
    company_id: int
    picture: Optional[str] = None
    digital_card_url: Optional[str] = None
    qr_code_path: Optional[str] = None

    class Config:
        from_attributes = True
from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl


class CompanyBase(BaseModel):

    name: str
    about: Optional[str] = None
    website: Optional[HttpUrl] = None

    corporate_address: Optional[str] = None

    contact_number: Optional[str] = None
    contact_email: Optional[EmailStr] = None

    ceo_name: Optional[str] = None
    founder_name: Optional[str] = None

    mission: Optional[str] = None
    vision: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):

    name: Optional[str] = None
    about: Optional[str] = None
    website: Optional[HttpUrl] = None

    corporate_address: Optional[str] = None

    contact_number: Optional[str] = None
    contact_email: Optional[EmailStr] = None

    ceo_name: Optional[str] = None
    founder_name: Optional[str] = None

    mission: Optional[str] = None
    vision: Optional[str] = None


class CompanyResponse(CompanyBase):

    id: int
    logo: Optional[str] = None
    company_deck: Optional[str] = None

    class Config:
        from_attributes = True
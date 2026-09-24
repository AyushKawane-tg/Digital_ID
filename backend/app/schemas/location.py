from typing import Optional

from pydantic import BaseModel


class LocationBase(BaseModel):
    location_name: str
    address: str
    contact_number: Optional[str] = None


class LocationCreate(LocationBase):
    company_id: int


class LocationUpdate(BaseModel):
    location_name: Optional[str] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None


class LocationResponse(LocationBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True
from typing import Optional

from pydantic import BaseModel


class BadgeBase(BaseModel):

    title: str
    description: Optional[str] = None


class BadgeCreate(BadgeBase):
    company_id: int


class BadgeUpdate(BaseModel):

    title: Optional[str] = None
    description: Optional[str] = None


class BadgeResponse(BadgeBase):

    id: int
    company_id: int
    image_path: Optional[str] = None

    class Config:
        from_attributes = True
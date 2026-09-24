from typing import List

from pydantic import BaseModel


class ImportErrorRow(BaseModel):

    row: int
    employee_id: str | None = None
    error: str


class ImportResponse(BaseModel):

    status: str
    total_rows: int
    successful_rows: int
    failed_rows: int
    errors: List[ImportErrorRow] = []
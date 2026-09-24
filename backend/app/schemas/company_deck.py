from pydantic import BaseModel


class CompanyDeckResponse(BaseModel):

    company_id: int
    file_path: str
    file_name: str
    download_url: str
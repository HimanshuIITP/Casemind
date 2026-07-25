from pydantic import BaseModel
from typing import List, Optional

class HearingResponse(BaseModel):
    id: str
    case_id: str
    court: str
    judge: Optional[str] = None
    date: str
    time: str
    status: str
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedHearingResponse(BaseModel):
    items: List[HearingResponse]
    total: int
    page: int
    size: int
    pages: int

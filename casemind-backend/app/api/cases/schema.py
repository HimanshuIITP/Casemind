from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CaseBase(BaseModel):
    title: str
    description: str
    respondent_name: str
    court: str
    status: str = "pending"
    priority: str = "normal"
    lawyer: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    respondent_name: Optional[str] = None
    court: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    lawyer: Optional[str] = None

class CaseResponse(CaseBase):
    id: str
    case_id: str
    petitioner_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    next_hearing_date: Optional[str] = None
    client_name: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedCaseResponse(BaseModel):
    items: List[CaseResponse]
    total: int
    page: int
    size: int
    pages: int

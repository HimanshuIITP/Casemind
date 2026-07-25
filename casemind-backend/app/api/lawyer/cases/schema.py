from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from app.api.cases.schema import CaseResponse

class HearingItem(BaseModel):
    id: str
    case_id: str
    date: datetime
    type: str
    judge: Optional[str] = None
    court: str
    status: str
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class DocumentItem(BaseModel):
    id: str
    case_id: str
    title: str
    url: str
    type: str
    uploaded_by: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class TimelineItem(BaseModel):
    id: str
    case_id: str
    title: str
    description: str
    date: datetime
    type: str
    
    class Config:
        from_attributes = True

class NoteItem(BaseModel):
    id: str
    case_id: str
    title: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderItem(BaseModel):
    id: str
    case_id: str
    title: str
    date: datetime
    url: Optional[str] = None
    summary: Optional[str] = None
    
    class Config:
        from_attributes = True

class LawyerCaseDetailResponse(BaseModel):
    case_info: CaseResponse
    timeline: List[TimelineItem] = []
    evidence: List[DocumentItem] = []
    documents: List[DocumentItem] = []
    hearings: List[HearingItem] = []
    orders: List[OrderItem] = []
    notes: List[NoteItem] = []
    ai_summary: Optional[str] = None

    class Config:
        from_attributes = True

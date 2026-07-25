from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class EvidenceCreateRequest(BaseModel):
    case_id: str
    description: str
    file_url: Optional[str] = None
    mime_type: Optional[str] = None
    file_name: Optional[str] = None

class EvidenceResponse(BaseModel):
    id: str
    case_id: str
    description: str
    file_url: Optional[str] = None
    mime_type: Optional[str] = None
    file_name: Optional[str] = None
    uploaded_by: str
    uploaded_at: datetime

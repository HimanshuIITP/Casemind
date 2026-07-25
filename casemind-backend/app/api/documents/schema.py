from pydantic import BaseModel
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    case_id: str
    filename: str
    mime_type: str
    size: int
    uploaded_by: str
    created_at: datetime
    filepath: str  # Kept internal/hidden usually, but included here for completeness of reference

    class Config:
        from_attributes = True

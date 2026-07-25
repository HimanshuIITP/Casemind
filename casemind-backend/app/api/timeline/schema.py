from pydantic import BaseModel
from datetime import datetime

class TimelineEvent(BaseModel):
    id: str
    case_id: str
    title: str
    description: str
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True

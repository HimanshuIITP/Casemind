from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: Optional[str] = "info"
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    status: str = "Active"

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None

class ClientResponse(ClientBase):
    id: str
    lawyer_id: str
    cases_count: int = 0
    recent_activity: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

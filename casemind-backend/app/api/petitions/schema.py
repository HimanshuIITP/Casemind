from pydantic import BaseModel, Field
from typing import List, Optional

class PetitionCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=10)
    court: str = Field(...)
    respondent_name: str = Field(...)
    category: str = Field(...)
    priority: str = Field(default="normal")
    attachments: List[str] = Field(default_factory=list, description="List of document IDs")

class PetitionResponse(BaseModel):
    case_id: str
    message: str

class DraftRespondent(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class DraftPetitioner(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None

class PetitionDraft(BaseModel):
    petitioner: Optional[DraftPetitioner] = None
    respondents: Optional[List[DraftRespondent]] = None
    court: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    attachments: Optional[List[str]] = None
    
class DraftResponse(BaseModel):
    draft_id: str
    message: str

from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    prompt: str
    conversation_id: Optional[str] = None
    case_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

class CaseSummaryResponse(BaseModel):
    summary: str

class HealthCheckResponse(BaseModel):
    huggingface: str
    mongodb: str
    model: str
    response_time: float

class LegalResearchRequest(BaseModel):
    query: str
    case_id: Optional[str] = None

class LegalResearchResponse(BaseModel):
    research_results: str

from datetime import datetime
from typing import List

class ConversationItem(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

class ConversationListResponse(BaseModel):
    conversations: List[ConversationItem]

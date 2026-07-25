from pydantic import BaseModel
from typing import List, Optional

class DashboardUser(BaseModel):
    id: str
    name: str
    email: str
    role: str

class DashboardStats(BaseModel):
    active_cases: int
    pending_hearings: int
    uploaded_documents: int
    ai_queries: int

class RecentCase(BaseModel):
    id: str
    case_id: str
    title: str
    status: str
    court: str
    next_hearing: Optional[str]
    priority: Optional[str] = None
    client: Optional[str] = None

class Notification(BaseModel):
    id: str
    message: str
    created_at: str
    read: bool

class UpcomingHearing(BaseModel):
    id: str
    case_id: str
    case_title: str
    date: str
    court: str
    judge: Optional[str] = None

class CitizenDashboardResponse(BaseModel):
    user: DashboardUser
    stats: DashboardStats
    recent_cases: List[RecentCase]
    notifications: List[Notification]
    upcoming_hearings: List[UpcomingHearing]

class LawyerDashboardStats(BaseModel):
    active_clients: int
    active_cases: int
    hearings_today: int
    pending_drafts: int
    unread_notifications: int

class PriorityItem(BaseModel):
    id: str
    title: str
    type: str # e.g., 'hearing', 'evidence', 'draft', 'deadline'
    time: Optional[str] = None
    urgent: bool = False

class TaskItem(BaseModel):
    id: str
    title: str
    completed: bool
    due_date: Optional[str] = None

class AIInsight(BaseModel):
    id: str
    title: str
    description: str
    case_id: Optional[str] = None
    type: str # e.g., 'missing_document', 'contradiction', 'precedent'

class LawyerDashboardResponse(BaseModel):
    lawyer: DashboardUser
    stats: LawyerDashboardStats
    today_priorities: List[PriorityItem]
    active_cases: List[RecentCase]
    hearings: List[UpcomingHearing]
    tasks: List[TaskItem]
    recent_activity: List[Notification]
    notifications: List[Notification]
    ai_insights: List[AIInsight]
    calendar: List[UpcomingHearing]

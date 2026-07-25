from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.routes import citizen, lawyer, court, shared
from app.api.dashboard.router import router as dashboard_router
from app.api.cases.router import router as cases_router
from app.api.documents.router import router as documents_router
from app.api.petitions.router import router as petitions_router
from app.api.hearings.router import router as hearings_router
from app.api.notifications.router import router as notifications_router
from app.api.ai.router import router as ai_router
from app.api.timeline.router import router as timeline_router
from app.api.lawyer.clients.router import router as lawyer_clients_router
from app.api.lawyer.cases.router import router as lawyer_cases_router
from app.api.lawyer.evidence.router import router as lawyer_evidence_router
from app.api.lawyer.dashboard.router import router as lawyer_dashboard_router
from app.api.lawyer.calendar.router import router as lawyer_calendar_router
from app.api.lawyer.notifications.router import router as lawyer_notifications_router
from app.api.court.dashboard.router import router as court_dashboard_router
from app.api.cases.service import CaseService
import logging

app = FastAPI(
    title="CaseMind Authentication API",
    description="Backend API for CaseMind Judicial OS",
    version="1.0.0"
)

logger = logging.getLogger(__name__)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.exceptions import global_exception_handler
app.add_exception_handler(Exception, global_exception_handler)

from app.core.database import connect_to_mongo, close_mongo_connection, db

@app.on_event("startup")
async def startup_db_client():
    connect_to_mongo()
    try:
        await CaseService.setup_indexes(db.db)
        logger.info("Cases MongoDB indexes verified.")
    except Exception as e:
        logger.error(f"Failed to setup MongoDB indexes: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    close_mongo_connection()

# Include routers
app.include_router(citizen.router, prefix="/api/auth/citizen", tags=["Citizen"])
app.include_router(lawyer.router, prefix="/api/auth/lawyer", tags=["Lawyer"])
app.include_router(court.router, prefix="/api/auth/court", tags=["court_auth"])
app.include_router(shared.router, prefix="/api/auth", tags=["shared_auth"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(cases_router, prefix="/api/cases", tags=["cases"])
app.include_router(documents_router, prefix="/api/documents", tags=["documents"])
app.include_router(petitions_router, prefix="/api/petitions", tags=["petitions"])
app.include_router(hearings_router, prefix="/api/hearings", tags=["hearings"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["notifications"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(timeline_router, prefix="/api/timeline", tags=["Timeline"])
app.include_router(lawyer_clients_router, prefix="/api/lawyer/clients", tags=["Lawyer Clients"])
app.include_router(lawyer_cases_router, prefix="/api/lawyer/cases", tags=["Lawyer Cases"])
app.include_router(lawyer_evidence_router, prefix="/api/lawyer/evidence", tags=["Lawyer Evidence"])
app.include_router(lawyer_dashboard_router, prefix="/api/lawyer/dashboard", tags=["Lawyer Dashboard"])
app.include_router(lawyer_calendar_router, prefix="/api/lawyer/calendar", tags=["Lawyer Calendar"])
app.include_router(lawyer_notifications_router, prefix="/api/lawyer/notifications", tags=["Lawyer Notifications"])
app.include_router(court_dashboard_router, prefix="/api/court/dashboard", tags=["Court Dashboard"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

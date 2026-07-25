from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.dashboard.schema import LawyerDashboardResponse
from app.api.dashboard.service import DashboardService

router = APIRouter()

def require_lawyer(token_data: TokenPayload = Depends(get_current_user_token)):
    if token_data.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to lawyers only"
        )
    return token_data

@router.get("", response_model=LawyerDashboardResponse)
async def get_lawyer_dashboard(
    token_data: TokenPayload = Depends(require_lawyer),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await DashboardService.get_lawyer_dashboard(token_data.sub, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}"
        )

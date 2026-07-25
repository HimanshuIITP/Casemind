from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.dashboard.schema import CitizenDashboardResponse, LawyerDashboardResponse
from app.api.dashboard.service import DashboardService

router = APIRouter()

@router.get("/citizen", response_model=CitizenDashboardResponse)
async def get_citizen_dashboard(
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if token_data.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        dashboard_data = await DashboardService.get_citizen_dashboard(token_data.sub, db)
        return dashboard_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}"
        )

@router.get("/lawyer", response_model=LawyerDashboardResponse)
async def get_lawyer_dashboard(
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if token_data.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        dashboard_data = await DashboardService.get_lawyer_dashboard(token_data.sub, db)
        return dashboard_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}"
        )

from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.hearings.schema import PaginatedHearingResponse
from app.api.hearings.service import HearingService

router = APIRouter()

def require_lawyer(token_data: TokenPayload = Depends(get_current_user_token)):
    if token_data.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to lawyers only"
        )
    return token_data

@router.get("", response_model=PaginatedHearingResponse)
async def get_lawyer_calendar(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    case_id: str = Query(None, description="Optional filter by case ID"),
    token_data: TokenPayload = Depends(require_lawyer),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await HearingService.get_hearings(
            user_id=token_data.sub,
            role="lawyer",
            db=db,
            page=page,
            size=size,
            case_id=case_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch calendar: {str(e)}"
        )

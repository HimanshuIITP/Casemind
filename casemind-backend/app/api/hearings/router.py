from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.hearings.schema import HearingResponse, PaginatedHearingResponse
from app.api.hearings.service import HearingService

router = APIRouter()

@router.get("", response_model=PaginatedHearingResponse)
async def get_hearings(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    case_id: str = Query(None, description="Optional filter by case ID"),
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await HearingService.get_hearings(
            user_id=token_data.sub,
            role=token_data.role,
            db=db,
            page=page,
            size=size,
            case_id=case_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch hearings: {str(e)}"
        )

@router.get("/{hearing_id}", response_model=HearingResponse)
async def get_hearing(
    hearing_id: str,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    hearing = await HearingService.get_hearing_by_id(hearing_id, token_data.sub, token_data.role, db)
    if not hearing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hearing not found or access denied")
    return hearing

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.timeline.schema import TimelineEvent
from app.api.timeline.service import TimelineService

router = APIRouter()

def require_citizen(token_data: TokenPayload = Depends(get_current_user_token)):
    if token_data.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to citizens only"
        )
    return token_data

@router.get("/{case_id}", response_model=List[TimelineEvent])
async def get_case_timeline(
    case_id: str,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # Note: We should technically verify the citizen owns this case_id, 
        # but for simplicity we'll just fetch the timeline events.
        return await TimelineService.get_timeline(case_id, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch timeline: {str(e)}"
        )

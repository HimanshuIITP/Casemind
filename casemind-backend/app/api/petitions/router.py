from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.petitions.schema import PetitionCreate, PetitionResponse
from app.api.petitions.service import PetitionService

router = APIRouter()

def require_citizen(token_data: TokenPayload = Depends(get_current_user_token)):
    if token_data.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to citizens only"
        )
    return token_data

@router.post("", response_model=PetitionResponse, status_code=status.HTTP_201_CREATED)
async def file_petition(
    petition_data: PetitionCreate,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await PetitionService.file_petition(petition_data, token_data.sub, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to file petition: {str(e)}"
        )

from app.api.petitions.schema import PetitionDraft, DraftResponse

@router.post("/draft", response_model=DraftResponse)
async def create_draft(
    draft_data: PetitionDraft,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    draft_id = await PetitionService.save_draft("new", draft_data.model_dump(), token_data.sub, db)
    return DraftResponse(draft_id=draft_id, message="Draft created successfully.")

@router.put("/draft/{draft_id}", response_model=DraftResponse)
async def update_draft(
    draft_id: str,
    draft_data: PetitionDraft,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    draft_id = await PetitionService.save_draft(draft_id, draft_data.model_dump(), token_data.sub, db)
    return DraftResponse(draft_id=draft_id, message="Draft updated successfully.")

@router.get("/draft/{draft_id}", response_model=PetitionDraft)
async def get_draft(
    draft_id: str,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    draft = await PetitionService.get_draft(draft_id, token_data.sub, db)
    if draft is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found"
        )
    return draft

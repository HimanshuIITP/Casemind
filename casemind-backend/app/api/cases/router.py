from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.cases.schema import CaseCreate, CaseUpdate, CaseResponse, PaginatedCaseResponse
from app.api.cases.service import CaseService

router = APIRouter()

def require_citizen(token_data: TokenPayload = Depends(get_current_user_token)):
    if token_data.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to citizens only"
        )
    return token_data

@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_data: CaseCreate,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await CaseService.create_case(case_data, token_data.sub, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create case: {str(e)}"
        )

@router.get("", response_model=PaginatedCaseResponse)
async def get_cases(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: str = Query(None, description="Search term for title or description"),
    status_filter: str = Query(None, alias="status", description="Filter by case status"),
    priority: str = Query(None, description="Filter by case priority"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await CaseService.get_cases(
            user_id=token_data.sub,
            db=db,
            page=page,
            size=size,
            search=search,
            status=status_filter,
            priority=priority,
            sort_by=sort_by,
            sort_order=sort_order
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch cases: {str(e)}"
        )

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    case = await CaseService.get_case_by_id(case_id, token_data.sub, db)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case

@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: str,
    case_update: CaseUpdate,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    case = await CaseService.update_case(case_id, case_update, token_data.sub, db)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: str,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    deleted = await CaseService.delete_case(case_id, token_data.sub, db)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return None

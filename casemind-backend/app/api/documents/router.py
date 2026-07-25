from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.documents.schema import DocumentResponse
from app.api.documents.service import DocumentService
from typing import List

router = APIRouter()

def require_citizen(token_data: TokenPayload = Depends(get_current_user_token)):
    if token_data.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to citizens only"
        )
    return token_data

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await DocumentService.upload_document(file, case_id, token_data.sub, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

@router.get("", response_model=List[DocumentResponse])
async def get_documents(
    case_id: str = Query(None, description="Optional filter by case ID"),
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await DocumentService.get_documents(token_data.sub, case_id, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch documents: {str(e)}"
        )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    token_data: TokenPayload = Depends(require_citizen),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    deleted = await DocumentService.delete_document(document_id, token_data.sub, db)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Document not found or you do not have permission to delete it"
        )
    return None

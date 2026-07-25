from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.lawyer.evidence.schema import EvidenceCreateRequest, EvidenceResponse
from datetime import datetime, timezone
from pymongo import DESCENDING

router = APIRouter()

def require_lawyer(token_data: TokenPayload = Depends(get_current_user_token)):
    if token_data.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to lawyers only"
        )
    return token_data

@router.get("", response_model=List[EvidenceResponse])
async def get_all_evidence(
    token_data: TokenPayload = Depends(require_lawyer),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        cursor = db["evidence"].find({"uploaded_by": token_data.sub}).sort("uploaded_at", DESCENDING)
        evidence_list = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            evidence_list.append(EvidenceResponse(**doc))
        return evidence_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    request: EvidenceCreateRequest,
    token_data: TokenPayload = Depends(require_lawyer),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Verify the case belongs to the lawyer
    case = await db["cases"].find_one({"case_id": request.case_id, "lawyer": token_data.sub})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or access denied")
        
    evidence_doc = {
        "case_id": request.case_id,
        "description": request.description,
        "file_url": request.file_url,
        "mime_type": request.mime_type,
        "file_name": request.file_name,
        "uploaded_by": token_data.sub,
        "uploaded_at": datetime.now(timezone.utc)
    }
    
    result = await db["evidence"].insert_one(evidence_doc)
    evidence_doc["id"] = str(result.inserted_id)
    
    return EvidenceResponse(**evidence_doc)

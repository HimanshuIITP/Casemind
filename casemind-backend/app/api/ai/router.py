from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.ai.schema import ChatRequest, ChatResponse, CaseSummaryResponse, HealthCheckResponse, LegalResearchRequest, LegalResearchResponse, ConversationListResponse
from app.api.ai.service import AIService
import time

router = APIRouter()

@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_ai(
    request: ChatRequest,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await AIService.chat(request, token_data.sub, db)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service failed: {str(e)}"
        )

@router.post("/legal-research", response_model=LegalResearchResponse, status_code=status.HTTP_200_OK)
async def perform_legal_research(
    request: LegalResearchRequest,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await AIService.legal_research(request, token_data.sub, db)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Legal research failed: {str(e)}"
        )

@router.get("/conversations", response_model=ConversationListResponse, status_code=status.HTTP_200_OK)
async def get_conversations(
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await AIService.get_conversations(token_data.sub, db)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch conversations: {str(e)}"
        )

@router.post("/case-summary/{case_id}", response_model=CaseSummaryResponse, status_code=status.HTTP_200_OK)
async def generate_case_summary(
    case_id: str,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        summary = await AIService.generate_case_summary(case_id, token_data.sub, db)
        return CaseSummaryResponse(summary=summary)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Case Summary generation failed: {str(e)}"
        )

@router.post("/bench-brief/{case_id}", response_model=CaseSummaryResponse, status_code=status.HTTP_200_OK)
async def generate_bench_brief(
    case_id: str,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        summary = await AIService.generate_bench_brief(case_id, token_data.sub, db)
        return CaseSummaryResponse(summary=summary)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bench Brief generation failed: {str(e)}"
        )

@router.get("/health", response_model=HealthCheckResponse, status_code=status.HTTP_200_OK)
async def check_health(db: AsyncIOMotorDatabase = Depends(get_db)):
    start_time = time.time()
    health_status = {
        "huggingface": "healthy", # Keeping the key so frontend typing doesn't break
        "mongodb": "healthy",
        "model": "mistral-large-latest",
        "response_time": 0.0
    }
    
    # Check DB
    try:
        await db.command("ping")
    except Exception:
        health_status["mongodb"] = "unhealthy"
        
    health_status["response_time"] = round(time.time() - start_time, 4)
    return HealthCheckResponse(**health_status)

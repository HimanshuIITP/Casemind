from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import math
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.cases.schema import CaseResponse, PaginatedCaseResponse
from app.api.cases.service import CaseService
from pymongo import ASCENDING, DESCENDING

router = APIRouter()

def require_lawyer(token_data: TokenPayload = Depends(get_current_user_token)):
    if token_data.role != "lawyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to lawyers only"
        )
    return token_data

@router.get("", response_model=PaginatedCaseResponse)
async def get_lawyer_cases(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: str = Query(None, description="Search term for title or description"),
    status_filter: str = Query(None, alias="status", description="Filter by case status"),
    priority: str = Query(None, description="Filter by case priority"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    token_data: TokenPayload = Depends(require_lawyer),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # Custom logic similar to CaseService.get_cases, but querying by lawyer instead of created_by
        query = {"lawyer": token_data.sub}
        
        if search:
            query["$text"] = {"$search": search}
        
        if status_filter:
            query["status"] = status_filter
            
        if priority:
            query["priority"] = priority

        sort_direction = DESCENDING if sort_order == "desc" else ASCENDING
        sort_spec = [(sort_by, sort_direction)]

        skip = (page - 1) * size

        cursor = db["cases"].find(query).sort(sort_spec).skip(skip).limit(size)
        
        cases_list = []
        async for doc in cursor:
            # Fetch next hearing
            next_hearing = await db["hearings"].find_one(
                {"case_id": doc["case_id"], "status": "Scheduled"},
                sort=[("date", ASCENDING)]
            )
            if next_hearing:
                doc["next_hearing_date"] = next_hearing.get("date")
            
            # Fetch client name (from users collection)
            if doc.get("created_by"):
                client_user = await db["users"].find_one({"_id": ObjectId(doc["created_by"])})
                if client_user:
                    doc["client_name"] = client_user.get("name")
                else:
                    # check in clients collection just in case
                    client_doc = await db["clients"].find_one({"_id": ObjectId(doc["created_by"])})
                    if client_doc:
                        doc["client_name"] = client_doc.get("name")

            cases_list.append(CaseService._map_mongo_case_to_response(doc))

        total_items = await db["cases"].count_documents(query)
        total_pages = math.ceil(total_items / size) if size > 0 else 1

        return PaginatedCaseResponse(
            items=cases_list,
            total=total_items,
            page=page,
            size=size,
            pages=total_pages
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch cases: {str(e)}"
        )

from app.api.lawyer.cases.schema import LawyerCaseDetailResponse, HearingItem, DocumentItem, TimelineItem, NoteItem, OrderItem

@router.get("/{case_id}", response_model=LawyerCaseDetailResponse)
async def get_lawyer_case(
    case_id: str,
    token_data: TokenPayload = Depends(require_lawyer),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        query = {"$or": [{"case_id": case_id}], "lawyer": token_data.sub}
        if ObjectId.is_valid(case_id):
            query["$or"].append({"_id": ObjectId(case_id)})

        case_doc = await db["cases"].find_one(query)
        
        if not case_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
            
        real_case_id = case_doc["case_id"]

        # 1. Base CaseResponse info
        next_hearing = await db["hearings"].find_one(
            {"case_id": real_case_id, "status": "Scheduled"},
            sort=[("date", ASCENDING)]
        )
        if next_hearing:
            case_doc["next_hearing_date"] = next_hearing.get("date")

        if case_doc.get("created_by"):
            client_user = await db["users"].find_one({"_id": ObjectId(case_doc["created_by"])})
            if client_user:
                case_doc["client_name"] = client_user.get("name")
            else:
                client_doc = await db["clients"].find_one({"_id": ObjectId(case_doc["created_by"])})
                if client_doc:
                    case_doc["client_name"] = client_doc.get("name")

        case_info = CaseService._map_mongo_case_to_response(case_doc)

        # Helper to map mongo _id to string id
        def map_id(doc):
            doc["id"] = str(doc["_id"])
            return doc

        # 2. Fetch Aggregated Data
        hearings = [map_id(h) async for h in db["hearings"].find({"case_id": real_case_id}).sort("date", ASCENDING)]
        documents = [map_id(d) async for d in db["documents"].find({"case_id": real_case_id}).sort("uploaded_at", DESCENDING)]
        evidence = [map_id(e) async for e in db["evidence"].find({"case_id": real_case_id}).sort("uploaded_at", DESCENDING)]
        timeline = [map_id(t) async for t in db["timeline"].find({"case_id": real_case_id}).sort("date", DESCENDING)]
        orders = [map_id(o) async for o in db["orders"].find({"case_id": real_case_id}).sort("date", DESCENDING)]
        notes = [map_id(n) async for n in db["notes"].find({"case_id": real_case_id}).sort("created_at", DESCENDING)]
        
        ai_summary_doc = await db["ai_summaries"].find_one({"case_id": real_case_id})
        ai_summary = ai_summary_doc.get("summary") if ai_summary_doc else None

        return LawyerCaseDetailResponse(
            case_info=case_info,
            timeline=timeline,
            evidence=evidence,
            documents=documents,
            hearings=hearings,
            orders=orders,
            notes=notes,
            ai_summary=ai_summary
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch case: {str(e)}"
        )

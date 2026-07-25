import math
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import ASCENDING
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.hearings.schema import HearingResponse, PaginatedHearingResponse

class HearingService:
    @staticmethod
    def _map_mongo_hearing_to_response(mongo_hearing: dict) -> HearingResponse:
        mongo_hearing["id"] = str(mongo_hearing["_id"])
        
        # Ensure dates are strings for the response model as requested
        if isinstance(mongo_hearing.get("date"), datetime):
            mongo_hearing["date"] = mongo_hearing["date"].isoformat()
            
        return HearingResponse(**mongo_hearing)

    @staticmethod
    async def get_hearings(
        user_id: str, 
        role: str,
        db: AsyncIOMotorDatabase,
        page: int = 1,
        size: int = 10,
        case_id: str = None
    ) -> PaginatedHearingResponse:
        
        # 1. Fetch all case_ids belonging to this user
        if role == "lawyer":
            case_query = {"lawyer": user_id}
        else:
            case_query = {"created_by": user_id}
            
        if case_id:
            case_query["case_id"] = case_id
            
        cases_cursor = db["cases"].find(case_query, {"case_id": 1})
        case_ids = []
        async for case in cases_cursor:
            if "case_id" in case:
                case_ids.append(case["case_id"])

        if not case_ids:
            return PaginatedHearingResponse(items=[], total=0, page=page, size=size, pages=0)

        # 2. Query hearings that belong to these cases
        query = {"case_id": {"$in": case_ids}}
        
        # Sort by date ASCENDING (upcoming first)
        sort_spec = [("date", ASCENDING), ("time", ASCENDING)]

        # Pagination
        skip = (page - 1) * size

        cursor = db["hearings"].find(query).sort(sort_spec).skip(skip).limit(size)
        
        hearings_list = []
        async for doc in cursor:
            hearings_list.append(HearingService._map_mongo_hearing_to_response(doc))

        total_items = await db["hearings"].count_documents(query)
        total_pages = math.ceil(total_items / size) if size > 0 else 1

        return PaginatedHearingResponse(
            items=hearings_list,
            total=total_items,
            page=page,
            size=size,
            pages=total_pages
        )

    @staticmethod
    async def get_hearing_by_id(hearing_id: str, user_id: str, role: str, db: AsyncIOMotorDatabase) -> HearingResponse:
        if not ObjectId.is_valid(hearing_id):
            return None
            
        # Fetch the hearing
        hearing_doc = await db["hearings"].find_one({"_id": ObjectId(hearing_id)})
        if not hearing_doc:
            return None
            
        # Verify ownership by checking the case
        case_id = hearing_doc.get("case_id")
        if not case_id:
            return None
            
        if role == "lawyer":
            case_query = {"case_id": case_id, "lawyer": user_id}
        else:
            case_query = {"case_id": case_id, "created_by": user_id}
            
        case_doc = await db["cases"].find_one(case_query)
        if not case_doc:
            return None # The user does not own the case for this hearing
            
        return HearingService._map_mongo_hearing_to_response(hearing_doc)

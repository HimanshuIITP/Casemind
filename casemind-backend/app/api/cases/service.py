import uuid
from datetime import datetime, timezone
import math
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.cases.schema import CaseCreate, CaseUpdate, CaseResponse, PaginatedCaseResponse

class CaseService:
    @staticmethod
    async def setup_indexes(db: AsyncIOMotorDatabase):
        cases_collection = db["cases"]
        await cases_collection.create_index([("case_id", ASCENDING)], unique=True)
        await cases_collection.create_index([("created_by", ASCENDING)])
        await cases_collection.create_index([("status", ASCENDING)])
        await cases_collection.create_index([("title", "text"), ("description", "text")])

    @staticmethod
    def _map_mongo_case_to_response(mongo_case: dict) -> CaseResponse:
        mongo_case["id"] = str(mongo_case["_id"])
        if isinstance(mongo_case.get("created_at"), str):
            mongo_case["created_at"] = datetime.fromisoformat(mongo_case["created_at"].replace("Z", "+00:00"))
        if isinstance(mongo_case.get("updated_at"), str):
            mongo_case["updated_at"] = datetime.fromisoformat(mongo_case["updated_at"].replace("Z", "+00:00"))
        return CaseResponse(**mongo_case)

    @staticmethod
    async def create_case(case_data: CaseCreate, user_id: str, db: AsyncIOMotorDatabase) -> CaseResponse:
        case_dict = case_data.model_dump()
        
        # Generate custom fields
        case_id_prefix = "CM"
        short_uuid = str(uuid.uuid4().hex)[:6].upper()
        case_dict["case_id"] = f"{case_id_prefix}-{short_uuid}"
        
        case_dict["petitioner_id"] = user_id
        case_dict["created_by"] = user_id
        
        now = datetime.now(timezone.utc)
        case_dict["created_at"] = now
        case_dict["updated_at"] = now

        result = await db["cases"].insert_one(case_dict)
        case_dict["_id"] = result.inserted_id

        return CaseService._map_mongo_case_to_response(case_dict)

    @staticmethod
    async def get_cases(
        user_id: str, 
        db: AsyncIOMotorDatabase,
        page: int = 1,
        size: int = 10,
        search: str = None,
        status: str = None,
        priority: str = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> PaginatedCaseResponse:
        
        # Build Query
        query = {"created_by": user_id}
        
        if search:
            query["$text"] = {"$search": search}
        
        if status:
            query["status"] = status
            
        if priority:
            query["priority"] = priority

        # Build Sort
        sort_direction = DESCENDING if sort_order == "desc" else ASCENDING
        sort_spec = [(sort_by, sort_direction)]

        # Pagination
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

    @staticmethod
    async def get_case_by_id(case_id_or_oid: str, user_id: str, db: AsyncIOMotorDatabase) -> CaseResponse:
        query = {"$or": [{"case_id": case_id_or_oid}], "created_by": user_id}
        
        if ObjectId.is_valid(case_id_or_oid):
            query["$or"].append({"_id": ObjectId(case_id_or_oid)})

        case_doc = await db["cases"].find_one(query)
        
        if not case_doc:
            return None
            
        next_hearing = await db["hearings"].find_one(
            {"case_id": case_doc["case_id"], "status": "Scheduled"},
            sort=[("date", ASCENDING)]
        )
        if next_hearing:
            case_doc["next_hearing_date"] = next_hearing.get("date")
            
        return CaseService._map_mongo_case_to_response(case_doc)

    @staticmethod
    async def update_case(case_id_or_oid: str, case_update: CaseUpdate, user_id: str, db: AsyncIOMotorDatabase) -> CaseResponse:
        query = {"$or": [{"case_id": case_id_or_oid}], "created_by": user_id}
        if ObjectId.is_valid(case_id_or_oid):
            query["$or"].append({"_id": ObjectId(case_id_or_oid)})

        update_data = {k: v for k, v in case_update.model_dump().items() if v is not None}
        
        if not update_data:
            return await CaseService.get_case_by_id(case_id_or_oid, user_id, db)

        update_data["updated_at"] = datetime.now(timezone.utc)

        result = await db["cases"].find_one_and_update(
            query,
            {"$set": update_data},
            return_document=True
        )

        if not result:
            return None
            
        return CaseService._map_mongo_case_to_response(result)

    @staticmethod
    async def delete_case(case_id_or_oid: str, user_id: str, db: AsyncIOMotorDatabase) -> bool:
        query = {"$or": [{"case_id": case_id_or_oid}], "created_by": user_id}
        if ObjectId.is_valid(case_id_or_oid):
            query["$or"].append({"_id": ObjectId(case_id_or_oid)})

        result = await db["cases"].delete_one(query)
        return result.deleted_count > 0

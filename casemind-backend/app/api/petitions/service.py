from datetime import datetime, timezone
from pymongo import ReturnDocument
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.petitions.schema import PetitionCreate, PetitionResponse

class PetitionService:
    @staticmethod
    async def get_next_case_id(db: AsyncIOMotorDatabase) -> str:
        current_year = datetime.now(timezone.utc).year
        counter_id = f"case_id_{current_year}"
        
        counter = await db["counters"].find_one_and_update(
            {"_id": counter_id},
            {"$inc": {"sequence_value": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        
        sequence_number = counter["sequence_value"]
        # Format: CM-YYYY-XXXXXX
        return f"CM-{current_year}-{sequence_number:06d}"

    @staticmethod
    async def file_petition(
        petition_data: PetitionCreate,
        user_id: str,
        db: AsyncIOMotorDatabase
    ) -> PetitionResponse:
        
        # 1. Generate ID
        case_id = await PetitionService.get_next_case_id(db)
        
        now = datetime.now(timezone.utc)
        
        # 2. Case Creation
        case_dict = {
            "case_id": case_id,
            "title": petition_data.title,
            "description": petition_data.description,
            "respondent_name": petition_data.respondent_name,
            "court": petition_data.court,
            "category": petition_data.category,
            "priority": petition_data.priority,
            "status": "Pending",
            "petitioner_id": user_id,
            "created_by": user_id,
            "created_at": now,
            "updated_at": now
        }
        await db["cases"].insert_one(case_dict)
        
        # 3. Associate Attachments
        if petition_data.attachments:
            from bson import ObjectId
            # Update the documents to belong to this case
            # Filtering out invalid ObjectIds first
            valid_doc_ids = [ObjectId(doc_id) for doc_id in petition_data.attachments if ObjectId.is_valid(doc_id)]
            if valid_doc_ids:
                await db["documents"].update_many(
                    {"_id": {"$in": valid_doc_ids}, "uploaded_by": user_id},
                    {"$set": {"case_id": case_id}}
                )

        # 4. Timeline Creation
        timeline_event = {
            "case_id": case_id,
            "title": "Petition Filed",
            "description": "Initial petition submitted to registry.",
            "created_by": user_id,
            "created_at": now
        }
        await db["timeline"].insert_one(timeline_event)
        
        return PetitionResponse(
            case_id=case_id,
            message="Petition filed successfully."
        )

    @staticmethod
    async def save_draft(
        draft_id: str,
        draft_data: dict,
        user_id: str,
        db: AsyncIOMotorDatabase
    ) -> str:
        import uuid
        from datetime import datetime, timezone
        
        now = datetime.now(timezone.utc)
        
        if not draft_id or draft_id == "new":
            draft_id = str(uuid.uuid4())
            doc = {
                "_id": draft_id,
                "user_id": user_id,
                "data": draft_data,
                "created_at": now,
                "updated_at": now
            }
            await db["petition_drafts"].insert_one(doc)
        else:
            await db["petition_drafts"].update_one(
                {"_id": draft_id, "user_id": user_id},
                {
                    "$set": {
                        "data": draft_data,
                        "updated_at": now
                    }
                },
                upsert=True
            )
            
        return draft_id

    @staticmethod
    async def get_draft(
        draft_id: str,
        user_id: str,
        db: AsyncIOMotorDatabase
    ) -> dict:
        draft = await db["petition_drafts"].find_one({"_id": draft_id, "user_id": user_id})
        if not draft:
            return None
        return draft.get("data", {})

from pymongo import DESCENDING
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.timeline.schema import TimelineEvent
from typing import List

class TimelineService:
    @staticmethod
    async def get_timeline(case_id: str, db: AsyncIOMotorDatabase) -> List[TimelineEvent]:
        cursor = db["timeline"].find({"case_id": case_id}).sort("created_at", DESCENDING)
        events = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            events.append(TimelineEvent(**doc))
        return events

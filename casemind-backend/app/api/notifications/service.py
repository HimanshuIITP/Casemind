from datetime import datetime
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.notifications.schema import NotificationResponse
from typing import List

class NotificationService:
    @staticmethod
    def _map_mongo_notification_to_response(mongo_notif: dict) -> NotificationResponse:
        mongo_notif["id"] = str(mongo_notif["_id"])
        if isinstance(mongo_notif.get("created_at"), str):
            mongo_notif["created_at"] = datetime.fromisoformat(mongo_notif["created_at"].replace("Z", "+00:00"))
        return NotificationResponse(**mongo_notif)

    @staticmethod
    async def get_notifications(user_id: str, db: AsyncIOMotorDatabase) -> List[NotificationResponse]:
        query = {"user_id": user_id}
        
        # Sort unread first (False = 0, True = 1) -> ASCENDING
        # Then newest first -> DESCENDING
        sort_spec = [("is_read", ASCENDING), ("created_at", DESCENDING)]
        
        cursor = db["notifications"].find(query).sort(sort_spec)
        
        notifications_list = []
        async for doc in cursor:
            notifications_list.append(NotificationService._map_mongo_notification_to_response(doc))
            
        return notifications_list

    @staticmethod
    async def mark_as_read(notification_id: str, user_id: str, db: AsyncIOMotorDatabase) -> bool:
        if not ObjectId.is_valid(notification_id):
            return False
            
        result = await db["notifications"].update_one(
            {"_id": ObjectId(notification_id), "user_id": user_id},
            {"$set": {"is_read": True}}
        )
        return result.modified_count > 0

    @staticmethod
    async def mark_all_as_read(user_id: str, db: AsyncIOMotorDatabase) -> int:
        result = await db["notifications"].update_many(
            {"user_id": user_id, "is_read": False},
            {"$set": {"is_read": True}}
        )
        return result.modified_count

    @staticmethod
    async def delete_notification(notification_id: str, user_id: str, db: AsyncIOMotorDatabase) -> bool:
        if not ObjectId.is_valid(notification_id):
            return False
            
        result = await db["notifications"].delete_one(
            {"_id": ObjectId(notification_id), "user_id": user_id}
        )
        return result.deleted_count > 0

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.api.notifications.schema import NotificationResponse
from app.api.notifications.service import NotificationService
from typing import List

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        return await NotificationService.get_notifications(token_data.sub, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )

@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_as_read(
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    updated_count = await NotificationService.mark_all_as_read(token_data.sub, db)
    return {"message": f"Marked {updated_count} notifications as read"}

@router.put("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_as_read(
    notification_id: str,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    updated = await NotificationService.mark_as_read(notification_id, token_data.sub, db)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    deleted = await NotificationService.delete_notification(notification_id, token_data.sub, db)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return None

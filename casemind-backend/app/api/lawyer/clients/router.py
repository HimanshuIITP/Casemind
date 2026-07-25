from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.core.database import get_db
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from .schema import ClientCreate, ClientUpdate, ClientResponse
import datetime

router = APIRouter()

@router.get("/", response_model=list[ClientResponse])
async def list_clients(
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if token_data.role != "lawyer":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    clients_cursor = db["clients"].find({"lawyer_id": token_data.sub}).sort("created_at", -1)
    clients = []
    
    async for client in clients_cursor:
        # Calculate case count
        cases_count = await db["cases"].count_documents({"lawyer": token_data.sub, "created_by": str(client["_id"])})
        
        # Recent activity - mock or fetch from notifications
        recent_activity = "Added to system"
        # We could query notifications here, but keeping it simple for now
        
        clients.append(
            ClientResponse(
                id=str(client["_id"]),
                name=client["name"],
                email=client["email"],
                phone=client.get("phone", ""),
                status=client.get("status", "Active"),
                lawyer_id=client["lawyer_id"],
                cases_count=cases_count,
                recent_activity=recent_activity,
                created_at=client["created_at"],
                updated_at=client["updated_at"]
            )
        )
    return clients

@router.post("/", response_model=ClientResponse)
async def create_client(
    data: ClientCreate,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if token_data.role != "lawyer":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    client_dict = data.dict()
    client_dict["lawyer_id"] = token_data.sub
    client_dict["created_at"] = datetime.datetime.utcnow()
    client_dict["updated_at"] = datetime.datetime.utcnow()
    
    result = await db["clients"].insert_one(client_dict)
    
    return ClientResponse(
        id=str(result.inserted_id),
        name=client_dict["name"],
        email=client_dict["email"],
        phone=client_dict["phone"],
        status=client_dict["status"],
        lawyer_id=client_dict["lawyer_id"],
        cases_count=0,
        recent_activity="Client created",
        created_at=client_dict["created_at"],
        updated_at=client_dict["updated_at"]
    )

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if token_data.role != "lawyer":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    client = await db["clients"].find_one({"_id": ObjectId(client_id), "lawyer_id": token_data.sub})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    cases_count = await db["cases"].count_documents({"lawyer": token_data.sub, "created_by": client_id})
    
    return ClientResponse(
        id=str(client["_id"]),
        name=client["name"],
        email=client["email"],
        phone=client.get("phone", ""),
        status=client.get("status", "Active"),
        lawyer_id=client["lawyer_id"],
        cases_count=cases_count,
        recent_activity="Profile viewed",
        created_at=client["created_at"],
        updated_at=client["updated_at"]
    )

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    data: ClientUpdate,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if token_data.role != "lawyer":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    client = await db["clients"].find_one({"_id": ObjectId(client_id), "lawyer_id": token_data.sub})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    update_data = data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.datetime.utcnow()
    
    await db["clients"].update_one(
        {"_id": ObjectId(client_id)},
        {"$set": update_data}
    )
    
    updated_client = await db["clients"].find_one({"_id": ObjectId(client_id)})
    cases_count = await db["cases"].count_documents({"lawyer": token_data.sub, "created_by": client_id})
    
    return ClientResponse(
        id=str(updated_client["_id"]),
        name=updated_client["name"],
        email=updated_client["email"],
        phone=updated_client.get("phone", ""),
        status=updated_client.get("status", "Active"),
        lawyer_id=updated_client["lawyer_id"],
        cases_count=cases_count,
        recent_activity="Profile updated",
        created_at=updated_client["created_at"],
        updated_at=updated_client["updated_at"]
    )

@router.delete("/{client_id}")
async def delete_client(
    client_id: str,
    token_data: TokenPayload = Depends(get_current_user_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if token_data.role != "lawyer":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    result = await db["clients"].delete_one({"_id": ObjectId(client_id), "lawyer_id": token_data.sub})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
        
    return {"message": "Client deleted successfully"}

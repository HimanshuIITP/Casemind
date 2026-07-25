from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import CitizenCreate, CitizenLogin, LoginResponse, CitizenOut
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/signup", response_model=LoginResponse)
async def signup_citizen(data: CitizenCreate):
    db = get_db()
    existing_user = await db["users"].find_one({"email": data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    citizen_doc = {
        "full_name": data.full_name,
        "email": data.email,
        "phone": data.phone,
        "password": get_password_hash(data.password),
        "role": "citizen",
        "is_verified": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db["users"].insert_one(citizen_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(subject=user_id, role="citizen")
    
    user_out = {
        "_id": user_id,
        "full_name": citizen_doc["full_name"],
        "email": citizen_doc["email"],
        "phone": citizen_doc["phone"],
        "role": citizen_doc["role"],
        "is_verified": citizen_doc["is_verified"],
        "is_active": citizen_doc["is_active"]
    }
    
    return LoginResponse(
        success=True,
        message="Citizen registered successfully",
        access_token=access_token,
        user=user_out
    )

@router.post("/login", response_model=LoginResponse)
async def login_citizen(data: CitizenLogin):
    db = get_db()
    user = await db["users"].find_one({"email": data.email, "role": "citizen"})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    access_token = create_access_token(subject=str(user["_id"]), role="citizen")
    
    user_out = {
        "_id": str(user["_id"]),
        "full_name": user["full_name"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
        "is_verified": user["is_verified"],
        "is_active": user["is_active"]
    }
    
    return LoginResponse(
        success=True,
        message="Login successful",
        access_token=access_token,
        user=user_out
    )

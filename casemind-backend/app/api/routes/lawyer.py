from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import LawyerCreate, LawyerLogin, LoginResponse, LawyerOut
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/signup", response_model=LoginResponse)
async def signup_lawyer(data: LawyerCreate):
    db = get_db()
    existing_user = await db["lawyers"].find_one({"email": data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    lawyer_doc = {
        "full_name": data.full_name,
        "email": data.email,
        "phone": data.phone,
        "password": get_password_hash(data.password),
        "bar_council_number": data.bar_council_number,
        "state_bar": data.state_bar,
        "role": "lawyer",
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db["lawyers"].insert_one(lawyer_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(subject=user_id, role="lawyer")
    
    user_out = {
        "_id": user_id,
        "full_name": lawyer_doc["full_name"],
        "email": lawyer_doc["email"],
        "phone": lawyer_doc["phone"],
        "bar_council_number": lawyer_doc["bar_council_number"],
        "state_bar": lawyer_doc["state_bar"],
        "role": lawyer_doc["role"],
        "is_verified": lawyer_doc["is_verified"]
    }
    
    return LoginResponse(
        success=True,
        message="Lawyer registered successfully",
        access_token=access_token,
        user=user_out
    )

@router.post("/login", response_model=LoginResponse)
async def login_lawyer(data: LawyerLogin):
    db = get_db()
    user = await db["lawyers"].find_one({"email": data.email, "role": "lawyer"})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    access_token = create_access_token(subject=str(user["_id"]), role="lawyer")
    
    user_out = {
        "_id": str(user["_id"]),
        "full_name": user["full_name"],
        "email": user["email"],
        "phone": user["phone"],
        "bar_council_number": user["bar_council_number"],
        "state_bar": user["state_bar"],
        "role": user["role"],
        "is_verified": user["is_verified"]
    }
    
    return LoginResponse(
        success=True,
        message="Login successful",
        access_token=access_token,
        user=user_out
    )

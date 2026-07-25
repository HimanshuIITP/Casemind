from fastapi import APIRouter, HTTPException, status
from app.models.schemas import CourtLogin, CourtCreate, LoginResponse, CourtOut
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=LoginResponse)
async def register_court(data: CourtCreate):
    db = get_db()
    
    # Check if court user already exists
    existing_user = await db["court_users"].find_one({"official_email": data.official_email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Official email already registered.")

    existing_court = await db["court_users"].find_one({"court_id": data.court_id})
    if existing_court:
        raise HTTPException(status_code=400, detail="Court ID already registered.")

    # Create new court user
    court_doc = {
        "name": data.name,
        "official_email": data.official_email,
        "court_id": data.court_id,
        "designation": data.designation,
        "password": get_password_hash(data.password),
        "role": "court",
        "is_verified": True # Auto-verify for demo
    }
    
    result = await db["court_users"].insert_one(court_doc)
    new_user_id = result.inserted_id
    
    # Generate token
    access_token = create_access_token(subject=str(new_user_id), role="court")
    
    user_out = {
        "_id": str(new_user_id),
        "name": data.name,
        "official_email": data.official_email,
        "court_id": data.court_id,
        "designation": data.designation,
        "role": "court",
        "is_verified": True
    }
    
    return LoginResponse(
        success=True,
        message="Demo Court Account created successfully",
        access_token=access_token,
        user=user_out
    )

@router.post("/login", response_model=LoginResponse)
async def login_court(data: CourtLogin):
    db = get_db()
    # Find the court user by official email and court ID
    user = await db["court_users"].find_one({
        "official_email": data.official_email, 
        "court_id": data.court_id,
        "role": "court"
    })
    
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials or unauthorized access"
        )
        
    access_token = create_access_token(subject=str(user["_id"]), role="court")
    
    user_out = {
        "_id": str(user["_id"]),
        "name": user["name"],
        "official_email": user["official_email"],
        "court_id": user["court_id"],
        "designation": user["designation"],
        "role": user["role"],
        "is_verified": user.get("is_verified", True)
    }
    
    return LoginResponse(
        success=True,
        message="Login successful",
        access_token=access_token,
        user=user_out
    )

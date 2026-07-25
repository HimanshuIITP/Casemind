from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies import get_current_user_token
from app.models.schemas import TokenPayload
from app.core.database import get_db
from bson import ObjectId

router = APIRouter()

@router.get("/me")
async def get_me(token_data: TokenPayload = Depends(get_current_user_token)):
    db = get_db()
    
    collection_map = {
        "citizen": "users",
        "lawyer": "lawyers",
        "court": "court_users"
    }
    
    collection_name = collection_map.get(token_data.role)
    if not collection_name:
        raise HTTPException(status_code=400, detail="Invalid role in token")
        
    user = await db[collection_name].find_one({"_id": ObjectId(token_data.sub)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Remove password hash before returning
    if "password" in user:
        del user["password"]
        
    user["_id"] = str(user["_id"])
    return {"success": True, "user": user}

@router.post("/logout")
async def logout():
    # Since we are using stateless JWTs, the client simply drops the token.
    # We could implement a token blacklist here in the future.
    return {"success": True, "message": "Successfully logged out"}

@router.post("/refresh-token")
async def refresh_token(token_data: TokenPayload = Depends(get_current_user_token)):
    from app.core.security import create_access_token
    # In a real app, you would verify a separate long-lived refresh token here.
    # For now, we just issue a new access token if the current one is still valid.
    new_token = create_access_token(subject=token_data.sub, role=token_data.role)
    return {"success": True, "access_token": new_token, "token_type": "Bearer"}

@router.post("/forgot-password")
async def forgot_password(email: str):
    # Placeholder for sending reset email
    return {"success": True, "message": "If an account exists, a reset link has been sent"}

@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    # Placeholder for verifying reset token and updating password
    return {"success": True, "message": "Password has been reset"}

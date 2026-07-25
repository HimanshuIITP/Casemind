from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# --- Citizen Schemas ---
class CitizenCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str

class CitizenLogin(BaseModel):
    email: EmailStr
    password: str

class CitizenOut(BaseModel):
    id: str = Field(alias="_id")
    full_name: str
    email: EmailStr
    phone: str
    role: str
    is_verified: bool
    is_active: bool
    
    class Config:
        populate_by_name = True

# --- Lawyer Schemas ---
class LawyerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    bar_council_number: str
    state_bar: str

class LawyerLogin(BaseModel):
    email: EmailStr
    password: str

class LawyerOut(BaseModel):
    id: str = Field(alias="_id")
    full_name: str
    email: EmailStr
    phone: str
    bar_council_number: str
    state_bar: str
    role: str
    is_verified: bool

    class Config:
        populate_by_name = True

# --- Court Schemas ---
class CourtCreate(BaseModel):
    name: str
    official_email: EmailStr
    court_id: str
    password: str
    designation: str

class CourtLogin(BaseModel):
    official_email: EmailStr
    court_id: str
    password: str

class CourtOut(BaseModel):
    id: str = Field(alias="_id")
    name: str
    official_email: EmailStr
    court_id: str
    designation: str
    role: str
    is_verified: bool

    class Config:
        populate_by_name = True

# --- Generic & Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "Bearer"

class LoginResponse(BaseModel):
    success: bool
    message: str
    access_token: str
    token_type: str = "Bearer"
    user: dict  # Will hold CitizenOut, LawyerOut, or CourtOut dict representation

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

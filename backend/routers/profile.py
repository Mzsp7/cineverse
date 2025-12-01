from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional

from database import get_session, User
from auth import get_current_user

router = APIRouter(tags=["User Profile"])

class UserProfileUpdate(BaseModel):
    full_name: str
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

class UserProfileRead(BaseModel):
    id: int
    full_name: str
    email: str
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

@router.get("/user/profile", response_model=UserProfileRead)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile information."""
    return UserProfileRead(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        country=current_user.country,
        state=current_user.state,
        city=current_user.city
    )

@router.put("/user/profile", response_model=UserProfileRead)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user's profile information."""
    # Update user fields
    current_user.full_name = profile_data.full_name
    current_user.country = profile_data.country
    current_user.state = profile_data.state
    current_user.city = profile_data.city
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return UserProfileRead(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        country=current_user.country,
        state=current_user.state,
        city=current_user.city
    )

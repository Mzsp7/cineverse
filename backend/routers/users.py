from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List

from database import get_session, User, UserPreference
from auth import get_current_user

router = APIRouter(tags=["User Preferences"])

class UserPreferenceUpdate(BaseModel):
    country: Optional[str] = None
    state: Optional[str] = None
    content_types: Optional[List[str]] = []
    preferred_genres: Optional[List[str]] = []

class UserPreferenceRead(BaseModel):
    country: Optional[str] = None
    state: Optional[str] = None
    content_types: List[str] = []
    preferred_genres: List[str] = []

@router.get("/user/preferences", response_model=UserPreferenceRead)
def get_preferences(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(UserPreference).where(UserPreference.user_id == user.id)
    prefs = session.exec(statement).first()
    
    if not prefs:
        return UserPreferenceRead()
        
    return UserPreferenceRead(
        country=prefs.country,
        state=prefs.state,
        content_types=prefs.content_types.split(",") if prefs.content_types else [],
        preferred_genres=prefs.preferred_genres.split(",") if prefs.preferred_genres else []
    )

@router.put("/user/preferences", response_model=UserPreferenceRead)
def update_preferences(prefs_data: UserPreferenceUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(UserPreference).where(UserPreference.user_id == user.id)
    prefs = session.exec(statement).first()
    
    if not prefs:
        prefs = UserPreference(user_id=user.id)
        session.add(prefs)
    
    if prefs_data.country is not None:
        prefs.country = prefs_data.country
    if prefs_data.state is not None:
        prefs.state = prefs_data.state
    
    # Convert lists to comma-separated strings
    if prefs_data.content_types is not None:
        prefs.content_types = ",".join(prefs_data.content_types)
    if prefs_data.preferred_genres is not None:
        prefs.preferred_genres = ",".join(prefs_data.preferred_genres)
        
    session.add(prefs)
    session.commit()
    session.refresh(prefs)
    
    return UserPreferenceRead(
        country=prefs.country,
        state=prefs.state,
        content_types=prefs.content_types.split(",") if prefs.content_types else [],
        preferred_genres=prefs.preferred_genres.split(",") if prefs.preferred_genres else []
    )

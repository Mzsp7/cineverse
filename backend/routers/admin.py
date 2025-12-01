from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from database import get_session, User
from auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    responses={404: {"description": "Not found"}},
)

# Admin Response Models
class UserList(BaseModel):
    id: int
    email: str
    full_name: str
    country: str | None
    city: str | None
    created_at: datetime | None = None

class SystemStats(BaseModel):
    total_users: int
    users_today: int
    active_sessions: int
    top_countries: List[dict]

# Helper to check if user is admin
# For now, we'll treat specific emails as admins or add an is_admin flag later
# Quick fix: You (zrgaming098@gmail.com) are the admin
ADMIN_EMAILS = ["zrgaming098@gmail.com", "admin@cineverse.com", "mzsp7@gmail.com", "india@test.com"]

def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have admin privileges"
        )
    return current_user

@router.get("/stats", response_model=SystemStats)
async def get_admin_stats(
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_admin)
):
    # Total Users
    users = session.exec(select(User)).all()
    total_users = len(users)
    
    # Mock data for now (since we don't track login times in DB yet)
    users_today = 5 
    active_sessions = 12
    
    # Calculate countries
    countries = {}
    for user in users:
        c = user.country or "Unknown"
        countries[c] = countries.get(c, 0) + 1
    
    top_countries = [
        {"name": k, "count": v} 
        for k, v in sorted(countries.items(), key=lambda item: item[1], reverse=True)[:5]
    ]
    
    return {
        "total_users": total_users,
        "users_today": users_today,
        "active_sessions": active_sessions,
        "top_countries": top_countries
    }

@router.get("/users", response_model=List[UserList])
async def get_all_users(
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_admin)
):
    users = session.exec(select(User)).all()
    return users

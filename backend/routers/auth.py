from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional

from database import get_session, User, LoginSession
from auth import create_access_token, get_password_hash, verify_password, get_current_login_session
from config import settings

router = APIRouter(tags=["Authentication"])

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=Token)
def register(user: UserCreate, request: Request, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    new_user = User(
        full_name=user.full_name,
        email=user.email, 
        hashed_password=hashed_pw,
        country=user.country,
        state=user.state,
        city=user.city,
        is_verified=False
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    # Create Login Session
    login_session = LoginSession(
        user_id=new_user.id,
        user_agent=request.headers.get("user-agent", "unknown"),
        ip_address=request.client.host
    )
    session.add(login_session)
    session.commit()
    session.refresh(login_session)
    
    access_token = create_access_token(data={"sub": new_user.email}, session_id=login_session.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create Login Session
    login_session = LoginSession(
        user_id=user.id,
        user_agent=request.headers.get("user-agent", "unknown"),
        ip_address=request.client.host
    )
    session.add(login_session)
    session.commit()
    session.refresh(login_session)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, session_id=login_session.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(current_session: LoginSession = Depends(get_current_login_session), session: Session = Depends(get_session)):
    """Invalidates the current session."""
    current_session.is_active = False
    session.add(current_session)
    session.commit()
    return {"message": "Logged out successfully"}

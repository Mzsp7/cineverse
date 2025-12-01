from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select
from database import User, LoginSession, get_session
from config import settings

# --- Config ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Helpers ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, session_id: int, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "sid": session_id})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        session_id: int = payload.get("sid")
        
        if email is None or session_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
        
    # 1. Check if session exists and is active
    login_session = session.get(LoginSession, session_id)
    if not login_session:
        raise credentials_exception
        
    if not login_session.is_active:
        raise credentials_exception
        
    if login_session.expires_at < datetime.utcnow():
        login_session.is_active = False
        session.add(login_session)
        session.commit()
        raise credentials_exception

    # 2. Get user and verify ownership
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None or user.id != login_session.user_id:
        raise credentials_exception
        
    return user

async def get_current_login_session(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> LoginSession:
    """Returns the active LoginSession object for the current request."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        session_id: int = payload.get("sid")
        if session_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    login_session = session.get(LoginSession, session_id)
    if not login_session or not login_session.is_active:
        raise credentials_exception
        
    return login_session

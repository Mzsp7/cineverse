from sqlmodel import SQLModel, create_engine, Field, Session, Relationship
from typing import Optional, List
from datetime import datetime, timedelta

# -------------------------------------------------
# Database setup
# -------------------------------------------------
sqlite_file_name = "database_v2.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=False, connect_args={"check_same_thread": False})

# -------------------------------------------------
# Models
# -------------------------------------------------
class User(SQLModel, table=True):
    """Core user record with authentication & privacy fields."""
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str = Field(index=True, unique=True)
    hashed_password: str
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    is_verified: bool = Field(default=False)  # email verification flag
    # Password‑reset flow (store hashed token, expiry)
    password_reset_token: Optional[str] = None
    password_reset_expiry: Optional[datetime] = None

    # Relationships
    watchlist_items: List["WatchlistItem"] = Relationship(back_populates="user")
    favorite_items: List["FavoriteItem"] = Relationship(back_populates="user")
    login_sessions: List["LoginSession"] = Relationship(back_populates="user")
    login_history: List["LoginHistory"] = Relationship(back_populates="user")
    preferences: Optional["UserPreference"] = Relationship(back_populates="user")

class UserPreference(SQLModel, table=True):
    """User preferences for onboarding and recommendations."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True) # One-to-one
    country: Optional[str] = None
    state: Optional[str] = None
    # Storing lists as comma-separated strings for SQLite simplicity
    content_types: Optional[str] = None # e.g. "movie,series,sports"
    preferred_genres: Optional[str] = None # e.g. "28,35,18" (TMDB IDs)
    
    user: User = Relationship(back_populates="preferences")

class OAuthAccount(SQLModel, table=True):
    """OAuth provider linkage (Google, Facebook, etc.)."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    provider: str
    provider_account_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

    user: User = Relationship(back_populates=None)

class LoginHistory(SQLModel, table=True):
    """Record of each successful login – useful for audits and device awareness."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: str
    user_agent: str
    country: Optional[str] = None

    user: User = Relationship(back_populates="login_history")

class LoginSession(SQLModel, table=True):
    """Active login session – enables logout/revoke and device tracking."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    user_agent: str
    ip_address: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=1))
    is_active: bool = Field(default=True)

    user: User = Relationship(back_populates="login_sessions")

# -------------------------------------------------
# Many‑to‑many tables for watchlist & favorites (store TMDB movie IDs)
# -------------------------------------------------
class WatchlistItem(SQLModel, table=True):
    """A TMDB movie ID saved to a user's watchlist."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    movie_id: int = Field(index=True)
    added_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="watchlist_items")

class FavoriteItem(SQLModel, table=True):
    """A TMDB movie ID marked as a favorite."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    movie_id: int = Field(index=True)
    added_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="favorite_items")

# -------------------------------------------------
# Helper functions
# -------------------------------------------------
def create_db_and_tables() -> None:
    """Create all tables – run once at startup or during migrations."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """FastAPI dependency that yields a DB session."""
    with Session(engine) as session:
        yield session

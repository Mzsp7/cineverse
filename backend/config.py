import os

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_IN_PROD")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    # Fallback to the key found in README if env var is not set
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY", "07095bfeaacd4e7e5f4ea1745afcfc61")
    TMDB_BASE_URL: str = "https://api.themoviedb.org/3"
    TMDB_IMAGE_BASE_URL: str = "https://image.tmdb.org/t/p/w500"
    TMDB_IMAGE_ORIGINAL_URL: str = "https://image.tmdb.org/t/p/original"

settings = Settings()

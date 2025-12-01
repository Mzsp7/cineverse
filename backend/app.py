from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import create_db_and_tables
from recommender import recommender
from tmdb import tmdb
from routers import auth, movies, users, profile, admin

# --- App Init ---
app = FastAPI(title="Movie Recommender API (OTT Edition)")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Startup/Shutdown ---
@app.on_event("startup")
async def on_startup():
    create_db_and_tables()
    recommender.load_data()

@app.on_event("shutdown")
async def on_shutdown():
    await tmdb.close()

# --- Routers ---
app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(users.router)
app.include_router(profile.router)
app.include_router(admin.router)

# --- Static Files (Lite Version) ---
# app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return {"message": "Movie Recommendation API is running"}

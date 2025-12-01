from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import asyncio

from recommender import recommender
from tmdb import tmdb
from llm_service import llm_service
from auth import get_current_user
from database import User

router = APIRouter(tags=["Movies & Recommendations"])

class RecommendationRequest(BaseModel):
    movie_name: str

@router.get("/home")
async def get_home_data(current_user: User = Depends(get_current_user)):
    """Aggregates data for the home page sections with language-based filtering."""
    try:
        # Get user's country for language-based filtering
        country_name = current_user.country if current_user and current_user.country else None
        region = tmdb.get_region_code(country_name) if country_name else None
        
        # Run these in parallel for speed - pass country_name for language filtering
        trending, popular, top_rated, upcoming, action, comedy = await asyncio.gather(
            tmdb.get_trending(region=region, country_name=country_name),
            tmdb.get_popular(region=region, country_name=country_name),
            tmdb.get_top_rated(region=region, country_name=country_name),
            tmdb.get_upcoming(region=region, country_name=country_name),
            tmdb.get_by_genre(28, region=region, country_name=country_name), # Action
            tmdb.get_by_genre(35, region=region, country_name=country_name),  # Comedy
            return_exceptions=True
        )
        
        def safe_list(data):
            return data if isinstance(data, list) else []
        
        region_name = country_name if country_name else "Global"
        
        return {
            "region": region_name,
            "sections": [
                {"title": f"Trending in {region_name}", "data": safe_list(trending)},
                {"title": f"Popular in {region_name}", "data": safe_list(popular)},
                {"title": "Top Rated", "data": safe_list(top_rated)},
                {"title": "Upcoming Releases", "data": safe_list(upcoming)},
                {"title": "Action Thrillers", "data": safe_list(action)},
                {"title": "Comedy Hits", "data": safe_list(comedy)},
            ]
        }
    except Exception as e:
        print(f"Error fetching home data: {e}")
        import traceback
        traceback.print_exc()
        return {
            "region": "Global",
            "sections": [
                {"title": "Trending Now", "data": []},
                {"title": "Popular on CineVerse", "data": []},
                {"title": "Top Rated", "data": []},
                {"title": "Upcoming Releases", "data": []},
                {"title": "Action Thrillers", "data": []},
                {"title": "Comedy Hits", "data": []},
            ]
        }

@router.get("/search/smart")
async def smart_search(query: str):
    """
    Intelligent search that understands intent.
    """
    intent = await llm_service.parse_intent(query)
    
    # If it's a genre/mood query, use discover
    if intent["type"] == "recommendation" and intent["genre"]:
        results = await tmdb.get_by_genre(intent["genre"])
        # Filter by year if present
        if intent["year"]:
            results = [m for m in results if m.get("release_date", "").startswith(str(intent["year"]))]
        return {"intent": intent, "results": results}
        
    # Default to standard search but with cleaned keywords
    results = await tmdb.search_movie(intent["keywords"] or query)
    return {"intent": intent, "results": results}

@router.get("/search")
async def search_movies(query: str):
    return await tmdb.search_movie(query)

@router.get("/movie/{movie_id}")
async def get_movie_details(movie_id: int):
    # This now returns full enriched data (providers, cast, videos)
    details = await tmdb.get_movie_details(movie_id)
    if not details:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # Get recommendations based on this movie's title using our ML engine
    ml_rec_ids = recommender.get_recommendations(details['title'])
    
    recommendations = []
    if ml_rec_ids:
        # Fetch details for recommended IDs from TMDB
        tasks = [tmdb.get_movie_details(mid) for mid in ml_rec_ids[:5]]
        results = await asyncio.gather(*tasks)
        recommendations = [r for r in results if r]
    
    return {
        "details": details,
        "recommendations": recommendations
    }

@router.post("/recommend")
async def get_recommendations_custom(request: RecommendationRequest):
    ml_rec_ids = recommender.get_recommendations(request.movie_name)
    
    if not ml_rec_ids:
        return []
        
    tasks = [tmdb.get_movie_details(mid) for mid in ml_rec_ids[:5]]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r]

@router.post("/recommend/ai")
async def get_ai_recommendations(request: RecommendationRequest, current_user: User = Depends(get_current_user)):
    """
    Get recommendations using the advanced LLM engine with specific rules:
    - Same language
    - Top 5 per country
    - Prioritize user's country
    """
    # 1. Get raw recommendations from LLM (Dict[Country, List[MovieTitle]])
    raw_recs = await llm_service.get_similar_movies(request.movie_name, user_country=current_user.country)
    
    structured_results = []
    
    # 2. Hydrate with real TMDB data
    for country, movies in raw_recs.items():
        country_movies = []
        for movie_title in movies:
            # Search for the movie to get details (poster, id, etc.)
            search_results = await tmdb.search_movie(movie_title)
            if search_results:
                # Take the first match
                country_movies.append(search_results[0])
        
        if country_movies:
            structured_results.append({
                "country": country,
                "movies": country_movies
            })
            
    return structured_results

@router.get("/discover/movies")
async def discover_movies(sort_by: str = "popularity.desc", with_genres: str = None, year: int = None):
    return await tmdb.discover_movies(sort_by, with_genres, year)

@router.get("/discover/series")
async def discover_series(sort_by: str = "popularity.desc", with_genres: str = None, year: int = None):
    return await tmdb.discover_tv(sort_by, with_genres, year)

@router.get("/search/person")
async def search_person(query: str):
    return await tmdb.search_person(query)

@router.get("/person/{person_id}/credits")
async def get_person_credits(person_id: int):
    return await tmdb.get_person_movie_credits(person_id)

@router.get("/universe/{key}")
async def get_universe_movies(key: str):
    movies = await tmdb.get_universe_content(key)
    return movies

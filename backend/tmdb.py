import httpx
import asyncio
import time
from typing import List, Dict, Any, Optional
from config import settings

class TMDBClient:
    # Country name to ISO 3166-1 code mapping for region
    COUNTRY_TO_REGION = {
        "India": "IN",
        "United States": "US",
        "United Kingdom": "GB",
        "Canada": "CA",
        "Australia": "AU",
        "Germany": "DE",
        "France": "FR",
        "Japan": "JP",
        "Brazil": "BR",
        "Mexico": "MX",
        "Spain": "ES",
        "Italy": "IT",
        "South Korea": "KR",
        "China": "CN",
    }
    
    # Country to primary language codes for content filtering
    COUNTRY_TO_LANGUAGES = {
        "India": ["hi", "ta", "te", "ml", "kn"],  # Hindi, Tamil, Telugu, Malayalam, Kannada
        "United States": ["en"],
        "United Kingdom": ["en"],
        "Canada": ["en", "fr"],
        "Australia": ["en"],
        "Germany": ["de"],
        "France": ["fr"],
        "Japan": ["ja"],
        "Brazil": ["pt"],
        "Mexico": ["es"],
        "Spain": ["es"],
        "Italy": ["it"],
        "South Korea": ["ko"],
        "China": ["zh"],
    }
    
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=settings.TMDB_BASE_URL,
            params={"api_key": settings.TMDB_API_KEY, "language": "en-US"},
            timeout=30.0,
            follow_redirects=True
        )
        # Simple in-memory cache: {url_key: (timestamp, data)}
        self._cache = {}
        self._cache_ttl = 300  # 5 minutes cache
    
    def get_region_code(self, country_name: str) -> Optional[str]:
        """Convert country name to ISO region code for TMDB API."""
        return self.COUNTRY_TO_REGION.get(country_name)
    
    def get_language_codes(self, country_name: str) -> Optional[List[str]]:
        """Get primary language codes for a country."""
        return self.COUNTRY_TO_LANGUAGES.get(country_name)

    async def close(self):
        await self.client.aclose()

    async def _get_cached(self, endpoint: str, params: dict = None) -> Any:
        """Helper to fetch with caching."""
        # Create a unique key for the request
        param_str = sorted(params.items()) if params else ""
        key = f"{endpoint}:{param_str}"
        
        now = time.time()
        if key in self._cache:
            timestamp, data = self._cache[key]
            if now - timestamp < self._cache_ttl:
                return data
        
        # Fetch fresh
        response = await self.client.get(endpoint, params=params)
        if response.status_code != 200:
            return None
        
        data = response.json()
        self._cache[key] = (now, data)
        return data

    # Static genre map for when API only returns IDs
    GENRE_MAP = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
        99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
        27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
        10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
    }

    def _process_movie(self, movie: Dict[str, Any]) -> Dict[str, Any]:
        """Helper to format movie data for frontend"""
        if not movie:
            return None
            
        poster_path = movie.get("poster_path")
        backdrop_path = movie.get("backdrop_path")
        
        # Get genres from objects OR map from IDs
        genres = []
        if "genres" in movie:
            genres = [g["name"] for g in movie.get("genres", [])]
        elif "genre_ids" in movie:
            genres = [self.GENRE_MAP.get(gid) for gid in movie.get("genre_ids", []) if gid in self.GENRE_MAP]
        
        return {
            "id": movie.get("id"),
            "title": movie.get("title") or movie.get("name"), # Handle TV shows too
            "overview": movie.get("overview"),
            "release_date": movie.get("release_date") or movie.get("first_air_date"),
            "vote_average": movie.get("vote_average"),
            "poster_url": f"{settings.TMDB_IMAGE_BASE_URL}{poster_path}" if poster_path else None,
            "backdrop_url": f"{settings.TMDB_IMAGE_ORIGINAL_URL}{backdrop_path}" if backdrop_path else None,
            "genres": genres,
            "genre_ids": movie.get("genre_ids", []),
            # Extended details for Movie Detail modal
            "budget": movie.get("budget"),
            "revenue": movie.get("revenue"),
            "status": movie.get("status"),
            "runtime": movie.get("runtime"),
            "original_language": movie.get("original_language")
        }

    async def get_popular(self, region: Optional[str] = None, country_name: Optional[str] = None) -> List[Dict[str, Any]]:
        # Use language-based filtering for better regional content
        if country_name and country_name in self.COUNTRY_TO_LANGUAGES:
            languages = self.COUNTRY_TO_LANGUAGES[country_name]
            # Use discover API with language filter
            params = {
                "sort_by": "popularity.desc",
                "with_original_language": "|".join(languages),  # OR condition for multiple languages
                "page": 1
            }
            data = await self._get_cached("/discover/movie", params=params)
        else:
            params = {"region": region} if region else {}
            data = await self._get_cached("/movie/popular", params=params)
        if not data: return []
        return [self._process_movie(m) for m in data.get("results", [])]

    async def get_top_rated(self, region: Optional[str] = None, country_name: Optional[str] = None) -> List[Dict[str, Any]]:
        # Use language-based filtering for better regional content
        if country_name and country_name in self.COUNTRY_TO_LANGUAGES:
            languages = self.COUNTRY_TO_LANGUAGES[country_name]
            params = {
                "sort_by": "vote_average.desc",
                "with_original_language": "|".join(languages),
                "vote_count.gte": 100,  # Minimum votes for quality
                "page": 1
            }
            data = await self._get_cached("/discover/movie", params=params)
        else:
            params = {"region": region} if region else {}
            data = await self._get_cached("/movie/top_rated", params=params)
        if not data: return []
        return [self._process_movie(m) for m in data.get("results", [])]

    async def get_upcoming(self, region: Optional[str] = None, country_name: Optional[str] = None) -> List[Dict[str, Any]]:
        # Use language-based filtering for better regional content
        if country_name and country_name in self.COUNTRY_TO_LANGUAGES:
            languages = self.COUNTRY_TO_LANGUAGES[country_name]
            from datetime import datetime
            today = datetime.now().strftime("%Y-%m-%d")
            params = {
                "sort_by": "popularity.desc",
                "with_original_language": "|".join(languages),
                "primary_release_date.gte": today,
                "page": 1
            }
            data = await self._get_cached("/discover/movie", params=params)
        else:
            params = {"region": region} if region else {}
            data = await self._get_cached("/movie/upcoming", params=params)
        if not data: return []
        return [self._process_movie(m) for m in data.get("results", [])]
        
    async def get_trending(self, region: Optional[str] = None, country_name: Optional[str] = None) -> List[Dict[str, Any]]:
        # Use language-based filtering for better regional content
        if country_name and country_name in self.COUNTRY_TO_LANGUAGES:
            languages = self.COUNTRY_TO_LANGUAGES[country_name]
            params = {
                "sort_by": "popularity.desc",
                "with_original_language": "|".join(languages),
                "page": 1
            }
            data = await self._get_cached("/discover/movie", params=params)
        elif region:
            params = {"sort_by": "popularity.desc", "region": region, "page": 1}
            data = await self._get_cached("/discover/movie", params=params)
        else:
            data = await self._get_cached("/trending/movie/week")
        if not data: return []
        return [self._process_movie(m) for m in data.get("results", [])]

    async def get_by_genre(self, genre_id: int, region: Optional[str] = None, country_name: Optional[str] = None) -> List[Dict[str, Any]]:
        params = {"with_genres": genre_id}
        # Use language-based filtering for better regional content
        if country_name and country_name in self.COUNTRY_TO_LANGUAGES:
            languages = self.COUNTRY_TO_LANGUAGES[country_name]
            params["with_original_language"] = "|".join(languages)
        elif region:
            params["region"] = region
        data = await self._get_cached("/discover/movie", params=params)
        if not data: return []
        return [self._process_movie(m) for m in data.get("results", [])]

    async def get_watch_providers(self, movie_id: int) -> Dict[str, Any]:
        # Providers change rarely, good candidate for caching
        data = await self._get_cached(f"/movie/{movie_id}/watch/providers")
        if not data: return None
        
        results = data.get("results", {})
        us_providers = results.get("US", {})
        return {
            "link": us_providers.get("link"),
            "flatrate": us_providers.get("flatrate", []),
            "rent": us_providers.get("rent", []),
            "buy": us_providers.get("buy", [])
        }

    async def get_credits(self, movie_id: int) -> Dict[str, Any]:
        data = await self._get_cached(f"/movie/{movie_id}/credits")
        if not data: return {"cast": [], "crew": []}
        
        cast = []
        for member in data.get("cast", [])[:10]:
            if member.get("profile_path"):
                member["profile_url"] = f"{settings.TMDB_IMAGE_BASE_URL}{member['profile_path']}"
            cast.append(member)
            
        return {"cast": cast, "crew": data.get("crew", [])[:5]}

    async def get_videos(self, movie_id: int) -> List[Dict[str, Any]]:
        data = await self._get_cached(f"/movie/{movie_id}/videos")
        if not data: return []
        
        results = data.get("results", [])
        trailers = [v for v in results if v.get("site") == "YouTube" and v.get("type") == "Trailer"]
        return trailers if trailers else results[:1]

    async def search_movie(self, query: str) -> List[Dict[str, Any]]:
        # Search results shouldn't be cached as aggressively or at all, but for now we skip caching or use short TTL
        # We'll use the direct client for search to ensure freshness or avoid cache explosion
        response = await self.client.get("/search/movie", params={"query": query})
        if response.status_code != 200: return []
        
        results = response.json().get("results", [])
        valid_results = [m for m in results if m.get("poster_path")]
        return [self._process_movie(m) for m in valid_results]

    async def get_movie_details(self, movie_id: int) -> Optional[Dict[str, Any]]:
        # This aggregates multiple cached calls
        details_task = self._get_cached(f"/movie/{movie_id}")
        credits_task = self.get_credits(movie_id)
        providers_task = self.get_watch_providers(movie_id)
        videos_task = self.get_videos(movie_id)
        
        details_res, credits, providers, videos = await asyncio.gather(
            details_task, credits_task, providers_task, videos_task, return_exceptions=True
        )
        
        if not details_res or isinstance(details_res, Exception):
            return None
            
        movie = self._process_movie(details_res)
        
        if not isinstance(credits, Exception): movie["credits"] = credits
        if not isinstance(providers, Exception): movie["providers"] = providers
        if not isinstance(videos, Exception): movie["videos"] = videos
            
        return movie

    async def search_person(self, query: str) -> List[Dict[str, Any]]:
        response = await self.client.get("/search/person", params={"query": query})
        if response.status_code != 200:
            return []
        results = response.json().get("results", [])
        # Filter for people with profile images
        valid_results = [p for p in results if p.get("profile_path")]
        
        processed = []
        for p in valid_results:
            processed.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "profile_url": f"{settings.TMDB_IMAGE_BASE_URL}{p.get('profile_path')}",
                "known_for_department": p.get("known_for_department")
            })
        return processed

    async def get_person_movie_credits(self, person_id: int) -> List[Dict[str, Any]]:
        # Cache this as it doesn't change often
        data = await self._get_cached(f"/person/{person_id}/movie_credits")
        if not data: return []
        
        cast = data.get("cast", [])
        crew = data.get("crew", [])
        
        # Combine and deduplicate by ID
        all_credits = {}
        
        # Process cast (acting roles)
        for m in cast:
            if m.get("poster_path"): # Only keep if it has a poster
                all_credits[m["id"]] = self._process_movie(m)
                all_credits[m["id"]]["role"] = "Actor"
                all_credits[m["id"]]["character"] = m.get("character")

        # Process crew (directing roles)
        for m in crew:
            if m.get("job") == "Director" and m.get("poster_path"):
                if m["id"] in all_credits:
                    all_credits[m["id"]]["role"] += ", Director"
                else:
                    all_credits[m["id"]] = self._process_movie(m)
                    all_credits[m["id"]]["role"] = "Director"
        
        # Sort by popularity (descending) if available, or release date
        results = list(all_credits.values())
        results.sort(key=lambda x: x.get("vote_average", 0) or 0, reverse=True)
        
        return results[:20] # Return top 20

    async def discover_movies(self, sort_by: str = "popularity.desc", with_genres: str = None, year: int = None) -> List[Dict[str, Any]]:
        params = {
            "sort_by": sort_by,
            "page": 1
        }
        if with_genres:
            params["with_genres"] = with_genres
        if year:
            params["primary_release_year"] = year
            
        data = await self._get_cached("/discover/movie", params=params)
        if not data: return []
        return [self._process_movie(m) for m in data.get("results", [])]

    async def discover_tv(self, sort_by: str = "popularity.desc", with_genres: str = None, year: int = None) -> List[Dict[str, Any]]:
        params = {
            "sort_by": sort_by,
            "page": 1
        }
        if with_genres:
            params["with_genres"] = with_genres
        if year:
            params["first_air_date_year"] = year
            
        data = await self._get_cached("/discover/tv", params=params)
        if not data: return []
        
        # Process TV shows slightly differently (title -> name, release_date -> first_air_date)
        results = []
        for show in data.get("results", []):
            if not show.get("poster_path"): continue
            results.append({
                "id": show.get("id"),
                "title": show.get("name"), # TV uses 'name'
                "overview": show.get("overview"),
                "release_date": show.get("first_air_date"),
                "vote_average": show.get("vote_average"),
                "poster_url": f"{settings.TMDB_IMAGE_BASE_URL}{show.get('poster_path')}",
                "backdrop_url": f"{settings.TMDB_IMAGE_ORIGINAL_URL}{show.get('backdrop_path')}" if show.get("backdrop_path") else None,
                "genres": [], # Genre names not included in list results usually
                "genre_ids": show.get("genre_ids", [])
            })
        return results

    async def get_universe_content(self, universe_key: str):
        """
        Fetch content for specific cinematic universes.
        """
        url = "/discover/movie"
        params = {"sort_by": "release_date.desc"}
        
        # Mapping for Universes
        if universe_key == 'mcu':
            # Marvel Cinematic Universe (Keyword: 180547)
            params['with_keywords'] = '180547'
            data = await self._get_cached(url, params)
            return [self._process_movie(m) for m in data.get("results", [])] if data else []
        
        elif universe_key == 'dceu':
            # DC Extended Universe (Keyword: 209130)
            params['with_keywords'] = '209130'
            data = await self._get_cached(url, params)
            return [self._process_movie(m) for m in data.get("results", [])] if data else []
            
        elif universe_key == 'harry_potter':
            # Harry Potter Collection (ID: 1241)
            return await self._get_collection_movies(1241)
            
        elif universe_key == 'star_wars':
            # Star Wars Collection (ID: 10)
            return await self._get_collection_movies(10)
            
        elif universe_key == 'spy_universe':
            # YRF Spy Universe
            movie_ids = [864692, 585268, 434555, 86024, 1003596, 1003598] 
            return await self._get_movies_by_ids(movie_ids)
            
        elif universe_key == 'cop_universe':
            # Rohit Shetty Cop Universe
            movie_ids = [626388, 525668, 273800, 72020]
            return await self._get_movies_by_ids(movie_ids)

        elif universe_key == 'bts':
            # BTS Content
            return await self.search_movie("BTS")

        return []

    async def _get_collection_movies(self, collection_id: int):
        url = f"/collection/{collection_id}"
        data = await self._get_cached(url)
        return [self._process_movie(m) for m in data.get("parts", [])] if data else []

    async def _get_movies_by_ids(self, movie_ids: list):
        tasks = []
        for mid in movie_ids:
            tasks.append(self.get_movie_details(mid))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [r for r in results if r and not isinstance(r, Exception)]

# Singleton instance
tmdb = TMDBClient()

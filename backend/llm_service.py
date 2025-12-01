import os
import json
from typing import Dict, Any, List, Optional

# Make google.generativeai optional
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("⚠️ Warning: google-generativeai not installed. LLM features will be simulated.")

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        
        if not GENAI_AVAILABLE:
            print("⚠️ Warning: google-generativeai not installed. LLM features will be simulated.")
        elif self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            print("⚠️ Warning: GEMINI_API_KEY not found. LLM features will be simulated.")

    async def get_similar_movies(self, movie_name: str, user_country: str = None) -> Dict[str, List[str]]:
        """
        Generates similar movie recommendations using the user's specific prompt rules.
        """
        if not self.model:
            return self._get_simulated_recommendations(movie_name)

        country_rule = ""
        if user_country:
            country_rule = f"6. PRIORITIZE movies from {user_country} if they match the language/style."

        prompt = f"""
        You are a movie recommendation engine.
        
        Task: Suggest only similar movies to the given movie: "{movie_name}".
        
        Rules:
        1. All recommended movies must be in the same language as the input movie.
        2. For each country that produces movies in this language, show TOP 5 related movies.
        3. Base recommendations on similarity, popularity, and ratings.
        4. Do not include movies from other languages.
        5. Do not show unrelated titles.
        {country_rule}
        
        Output Format:
        Return ONLY a raw JSON object (no markdown formatting) with this structure:
        {{
            "Country Name": ["Movie 1", "Movie 2", "Movie 3", "Movie 4", "Movie 5"],
            "Another Country": ["Movie A", "Movie B", ...]
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            # Clean up potential markdown code blocks
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
                
            return json.loads(text)
        except Exception as e:
            print(f"❌ LLM Error: {e}")
            return self._get_simulated_recommendations(movie_name)

    async def parse_intent(self, query: str) -> Dict[str, Any]:
        """
        Analyzes a natural language query to extract intent and entities.
        """
        if not self.model:
            return self._parse_intent_heuristic(query)

        prompt = f"""
        Analyze this movie search query: "{query}"
        
        Extract the following fields in JSON format:
        - type: "search" (specific movie), "recommendation" (vague/genre), or "person" (actor/director)
        - keywords: The core search terms (remove stop words)
        - genre: The TMDB genre ID if a genre is mentioned (Action: 28, Comedy: 35, Horror: 27, Romance: 10749, Sci-Fi: 878, Drama: 18, Animation: 16). Null if none.
        - year: The year if mentioned. Null if none.
        - mood: Any mood keywords (sad, happy, dark, etc). Null if none.
        
        Return ONLY the JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:-3]
            return json.loads(text)
        except Exception as e:
            print(f"❌ LLM Intent Error: {e}")
            return self._parse_intent_heuristic(query)

    def _get_simulated_recommendations(self, movie_name: str) -> Dict[str, List[str]]:
        """Fallback for when LLM is unavailable"""
        return {
            "Simulated Results": [
                f"Similar to {movie_name} 1",
                f"Similar to {movie_name} 2",
                f"Similar to {movie_name} 3",
                f"Similar to {movie_name} 4",
                f"Similar to {movie_name} 5"
            ]
        }

    def _parse_intent_heuristic(self, query: str) -> Dict[str, Any]:
        """Original regex-based heuristic fallback"""
        query = query.lower().strip()
        intent = {
            "type": "search",
            "keywords": query,
            "genre": None,
            "year": None,
            "mood": None
        }
        
        genres = {
            "action": 28, "comedy": 35, "horror": 27, "romance": 10749, 
            "scifi": 878, "sci-fi": 878, "drama": 18, "animation": 16
        }
        
        for name, gid in genres.items():
            if name in query:
                intent["genre"] = gid
                intent["keywords"] = query.replace(name, "").strip()
                intent["type"] = "recommendation"
                
        return intent

llm_service = LLMService()

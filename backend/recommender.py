import pandas as pd
import pickle
import os

class MovieRecommender:
    def __init__(self):
        self.movies_df = None
        self.cosine_sim = None
        self.data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

    def load_data(self):
        """Loads the pre-computed models from disk."""
        try:
            movies_path = os.path.join(self.data_path, "movies.pkl")
            sim_path = os.path.join(self.data_path, "similarity.pkl")
            
            if os.path.exists(movies_path) and os.path.exists(sim_path):
                self.movies_df = pd.read_pickle(movies_path)
                with open(sim_path, 'rb') as f:
                    self.cosine_sim = pickle.load(f)
                print("✅ ML Models loaded successfully.")
            else:
                print("⚠️ Warning: ML artifacts not found. Recommendations will not work.")
                self.movies_df = pd.DataFrame()
                self.cosine_sim = []
        except Exception as e:
            print(f"❌ Error loading ML models: {e}")

    def get_recommendations(self, movie_name: str):
        """
        Returns a list of TMDB IDs for recommended movies.
        """
        if self.movies_df is None or self.movies_df.empty:
            return []

        # Case insensitive partial match
        matching = self.movies_df[self.movies_df['title_x'].str.lower().str.contains(movie_name.lower(), na=False)]
        
        if len(matching) == 0:
            return []

        idx = matching.index[0]
        
        # Safety check for index bounds
        if idx >= len(self.cosine_sim):
            return []

        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Get top 5 (excluding self at index 0)
        top_indices = [i[0] for i in sim_scores[1:6]]
        
        # Return only the IDs (assuming 'id' column exists and matches TMDB ID)
        # The original dataset 'tmdb_5000_movies.csv' has an 'id' column which IS the TMDB ID.
        results = self.movies_df.iloc[top_indices]['id'].tolist()
        return results

# Singleton instance
recommender = MovieRecommender()

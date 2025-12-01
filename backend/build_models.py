import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import ast
import pickle
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'data')
OUTPUT_DIR = os.path.join(BASE_DIR, 'data')

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

LANGUAGE_MAPPING = {
    'en': 'English', 'hi': 'Hindi', 'ko': 'Korean', 'ja': 'Japanese',
    'fr': 'French', 'es': 'Spanish', 'de': 'German', 'zh': 'Chinese',
    'it': 'Italian', 'ru': 'Russian', 'pt': 'Portuguese', 'ar': 'Arabic',
    'tr': 'Turkish', 'ta': 'Tamil', 'te': 'Telugu', 'bn': 'Bengali',
    'ml': 'Malayalam'
}

def build_models():
    print("⏳ Loading data...")
    try:
        movies = pd.read_csv(os.path.join(DATA_DIR, 'tmdb_5000_movies.csv'))
        credits = pd.read_csv(os.path.join(DATA_DIR, 'tmdb_5000_credits.csv'))
    except FileNotFoundError:
        print(f"❌ Error: Data files not found in {DATA_DIR}")
        return

    # Merge
    print("🔄 Processing data...")
    credits = credits.rename(columns={'movie_id': 'id'})
    movies = movies.merge(credits, on='id')

    # Extract genres
    movies['genres'] = movies['genres'].apply(
        lambda x: ' '.join([i['name'] for i in ast.literal_eval(x)]) 
        if isinstance(x, str) and x.startswith('[') else ''
    )

    # Extract countries
    movies['production_countries'] = movies['production_countries'].apply(
        lambda x: ' '.join([i['name'] for i in ast.literal_eval(x)]) 
        if isinstance(x, str) and x.startswith('[') else ''
    )

    # Combine tags
    movies['tags'] = movies['overview'].fillna('') + ' ' + movies['genres'] + ' ' + movies['production_countries']

    # Language mapping
    movies['language_full'] = movies['original_language'].map(
        lambda x: LANGUAGE_MAPPING.get(x, x)
    )

    # Handle title column
    if 'title_x' not in movies.columns and 'title' in movies.columns:
        movies['title_x'] = movies['title']

    # Keep only necessary columns to save space
    # We need title_x for searching, id for uniqueness, and maybe others for display
    # We'll keep the whole dataframe for now as per original script, but maybe drop 'tags' after computing sim to save space?
    # Actually, let's keep it simple.
    
    print("🧮 Computing Similarity Matrix (this may take a moment)...")
    tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
    tfidf_matrix = tfidf.fit_transform(movies['tags'].values.astype('U'))
    cosine_sim = cosine_similarity(tfidf_matrix)

    print("💾 Saving models...")
    movies.to_pickle(os.path.join(OUTPUT_DIR, 'movies.pkl'))
    with open(os.path.join(OUTPUT_DIR, 'similarity.pkl'), 'wb') as f:
        pickle.dump(cosine_sim, f)

    print("✅ Build complete! Models saved to backend/data/")

if __name__ == "__main__":
    build_models()

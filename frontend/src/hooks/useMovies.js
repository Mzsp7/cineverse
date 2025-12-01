import { useState, useEffect } from 'react';
import api from '../api';
import { apiCache, getCacheKey } from '../utils/cache';

/**
 * Custom hook for fetching movies with caching and deduplication
 * Prevents redundant API calls for the same filter combination
 */
export function useMovies(filters = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchMovies = async () => {
            const cacheKey = getCacheKey('/discover/movies', filters);

            // Check cache first
            if (apiCache.has(cacheKey)) {
                setData(apiCache.get(cacheKey));
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Clean up empty params
                const params = { ...filters };
                if (!params.year) delete params.year;
                if (!params.with_genres) delete params.with_genres;

                const res = await api.get('/discover/movies', { params });

                if (!cancelled) {
                    setData(res.data);
                    apiCache.set(cacheKey, res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to fetch movies:', err);
                    setError(err.message || 'Failed to load movies');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchMovies();

        return () => {
            cancelled = true;
        };
    }, [JSON.stringify(filters)]); // Stringify to avoid object reference issues

    return { data, loading, error };
}

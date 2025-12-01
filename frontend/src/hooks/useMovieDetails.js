import { useState, useEffect } from 'react';
import api from '../api';
import { apiCache, getCacheKey } from '../utils/cache';

/**
 * Custom hook for fetching movie/series details with caching
 * Prevents re-fetching when user opens same movie multiple times
 */
export function useMovieDetails(movieId) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!movieId) return;

        let cancelled = false;

        const fetchDetails = async () => {
            // v2 forces a fresh fetch to get the new fields (budget, revenue, etc.)
            const cacheKey = getCacheKey(`/movie/${movieId}?v=2`);

            // Check cache first
            if (apiCache.has(cacheKey)) {
                setDetails(apiCache.get(cacheKey));
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const res = await api.get(`/movie/${movieId}`);

                if (!cancelled) {
                    setDetails(res.data);
                    apiCache.set(cacheKey, res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to fetch movie details:', err);
                    setError(err.message || 'Failed to load details');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchDetails();

        return () => {
            cancelled = true;
        };
    }, [movieId]);

    return { details, loading, error };
}

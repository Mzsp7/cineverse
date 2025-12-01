import { useState, useEffect } from 'react';
import api from '../api';
import { apiCache, getCacheKey } from '../utils/cache';

/**
 * Custom hook for fetching TV series with caching and deduplication
 */
export function useSeries(filters = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchSeries = async () => {
            const cacheKey = getCacheKey('/discover/series', filters);

            // Check cache first
            if (apiCache.has(cacheKey)) {
                setData(apiCache.get(cacheKey));
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const params = { ...filters };
                if (!params.year) delete params.year;
                if (!params.with_genres) delete params.with_genres;

                const res = await api.get('/discover/series', { params });

                if (!cancelled) {
                    setData(res.data);
                    apiCache.set(cacheKey, res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to fetch series:', err);
                    setError(err.message || 'Failed to load series');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchSeries();

        return () => {
            cancelled = true;
        };
    }, [JSON.stringify(filters)]);

    return { data, loading, error };
}

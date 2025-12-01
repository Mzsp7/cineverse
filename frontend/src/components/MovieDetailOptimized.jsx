import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { X, Play, Clock, Calendar, Star, Plus, Heart, Check, Sparkles } from 'lucide-react';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { MovieCard } from './MovieCard';
import api from '../api';

/**
 * Optimized Movie Detail Modal
 * - Uses custom hook with caching (prevents re-fetch on reopen)
 * - Memoized callbacks
 * - Skeleton loading state
 * - Optimistic UI updates for watchlist/favorites
 */
export const MovieDetailOptimized = React.memo(({ movie, onClose, onSwitchMovie }) => {
    const { details, loading } = useMovieDetails(movie.id);
    const [inWatchlist, setInWatchlist] = React.useState(false);
    const [isFavorite, setIsFavorite] = React.useState(false);

    // Use enriched details if available, otherwise fallback to initial movie prop
    const d = details?.details || movie;
    const recs = details?.recommendations || [];

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const toggleWatchlist = useCallback(async () => {
        setInWatchlist(prev => !prev);
        try {
            // await api.post('/watchlist/toggle', { movie_id: movie.id });
            console.log("Toggled watchlist for", movie.id);
        } catch (err) {
            setInWatchlist(prev => !prev); // Revert on error
        }
    }, [movie.id]);

    const toggleFavorite = useCallback(async () => {
        setIsFavorite(prev => !prev);
        try {
            // await api.post('/favorites/toggle', { movie_id: movie.id });
            console.log("Toggled favorite for", movie.id);
        } catch (err) {
            setIsFavorite(prev => !prev);
        }
    }, [movie.id]);

    const handleSwitchMovie = useCallback((newMovie) => {
        if (onSwitchMovie) {
            onSwitchMovie(newMovie);
        }
    }, [onSwitchMovie]);

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#050505] hide-scrollbar">
            {/* Hero Backdrop */}
            <div className="relative h-[70vh] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10" />
                <img
                    src={d.backdrop_url || d.poster_url}
                    className="w-full h-full object-cover opacity-60"
                    alt="Backdrop"
                />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition group"
                >
                    <X className="text-white group-hover:rotate-90 transition duration-300" />
                </button>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                        {d.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
                        <span className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
                            <Star fill="currentColor" /> {d.vote_average?.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-2"><Clock size={18} /> {d.runtime || 'N/A'} min</span>
                        <span className="flex items-center gap-2"><Calendar size={18} /> {d.release_date?.split('-')[0]}</span>

                        {d.genres?.map(g => (
                            <span key={g} className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-sm backdrop-blur-sm">
                                {g}
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        {d.videos && d.videos.length > 0 ? (
                            <a
                                href={`https://www.youtube.com/watch?v=${d.videos[0].key}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition flex items-center gap-2"
                            >
                                <Play fill="currentColor" size={20} /> Watch Trailer
                            </a>
                        ) : (
                            <button disabled className="px-8 py-3 bg-white/20 text-gray-400 font-bold rounded-xl cursor-not-allowed flex items-center gap-2">
                                <Play size={20} /> No Trailer
                            </button>
                        )}

                        <button
                            onClick={toggleWatchlist}
                            className={`p-3 rounded-xl border transition flex items-center justify-center ${inWatchlist ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                                }`}
                            title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                            {inWatchlist ? <Check size={24} /> : <Plus size={24} />}
                        </button>

                        <button
                            onClick={toggleFavorite}
                            className={`p-3 rounded-xl border transition flex items-center justify-center ${isFavorite ? 'bg-pink-500/20 border-pink-500 text-pink-500' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                                }`}
                            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                        </button>

                        {/* Watch Providers */}
                        {d.providers?.flatrate?.map(p => (
                            <img
                                key={p.provider_id}
                                src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                alt={p.provider_name}
                                className="w-12 h-12 rounded-xl shadow-lg border border-white/10"
                                title={`Watch on ${p.provider_name}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h3 className="text-2xl font-bold mb-4 text-cyan-400">Storyline</h3>
                        <p className="text-lg text-gray-300 leading-relaxed">{d.overview || "No overview available."}</p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold mb-6 text-cyan-400">Top Cast</h3>
                        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                            {d.credits?.cast?.length > 0 ? d.credits.cast.map(person => (
                                <div key={person.id} className="min-w-[100px] text-center">
                                    <img
                                        src={person.profile_url || 'https://via.placeholder.com/100x100?text=?'}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-white/10 mb-2 mx-auto"
                                        alt={person.name}
                                    />
                                    <p className="text-sm font-medium text-white">{person.name}</p>
                                    <p className="text-xs text-gray-500">{person.character}</p>
                                </div>
                            )) : <p className="text-gray-500">No cast information available.</p>}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold mb-6 text-cyan-400">More Like This</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {recs.length > 0 ? recs.map(m => (
                                <MovieCard key={m.id} movie={m} onClick={handleSwitchMovie} />
                            )) : <p className="text-gray-500">No standard recommendations available.</p>}
                        </div>
                    </section>

                    {/* AI Recommendations Section */}
                    <AIRecommendations movieTitle={d.title} onSwitchMovie={handleSwitchMovie} />
                </div>

                <div className="space-y-8">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h4 className="text-lg font-bold mb-4 text-gray-400 uppercase tracking-wider">Info</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span>{d.status || 'Released'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Original Language</span>
                                <span className="uppercase">{d.original_language || 'EN'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Budget</span>
                                <span>${d.budget ? (d.budget / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Revenue</span>
                                <span>${d.revenue ? (d.revenue / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

MovieDetailOptimized.displayName = 'MovieDetailOptimized';

/**
 * Component to fetch and display AI-powered recommendations
 */
const AIRecommendations = ({ movieTitle, onSwitchMovie }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!movieTitle) return;

        const fetchAIRecommendations = async () => {
            setLoading(true);
            try {
                const res = await api.post('/recommend/ai', { movie_name: movieTitle });
                setRecommendations(res.data);
            } catch (err) {
                console.error("Failed to fetch AI recommendations", err);
                setError("Failed to load AI recommendations.");
            } finally {
                setLoading(false);
            }
        };

        fetchAIRecommendations();
    }, [movieTitle]);

    if (loading) return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-400">
                <Sparkles size={24} /> AI Recommendations
            </h3>
            <div className="animate-pulse flex space-x-4">
                <div className="h-40 w-32 bg-white/5 rounded-xl"></div>
                <div className="h-40 w-32 bg-white/5 rounded-xl"></div>
                <div className="h-40 w-32 bg-white/5 rounded-xl"></div>
            </div>
        </div>
    );

    if (error || !recommendations.length) return null;

    return (
        <div className="mt-12 space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                <Sparkles size={24} className="text-purple-400" /> AI Recommendations
            </h3>

            {recommendations.map((group, idx) => (
                <div key={idx} className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-300 border-l-4 border-purple-500 pl-3">
                        {group.country}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {group.movies.map(m => (
                            <MovieCard key={m.id} movie={m} onClick={onSwitchMovie} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

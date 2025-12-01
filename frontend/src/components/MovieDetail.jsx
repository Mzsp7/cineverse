import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Clock, Calendar, Star, Plus, Heart, Check } from 'lucide-react';
import api from '../api';
import { GlassCard } from './GlassCard';

export function MovieDetail({ movie, onClose, onSwitchMovie }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/movie/${movie.id}`);
                setDetails(res.data);
                // In a real app, we would also check if the movie is in watchlist/favorites here
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [movie.id]);

    const toggleWatchlist = async () => {
        // Optimistic update
        setInWatchlist(!inWatchlist);
        try {
            // await api.post('/watchlist/toggle', { movie_id: movie.id });
            console.log("Toggled watchlist for", movie.id);
        } catch (err) {
            setInWatchlist(!inWatchlist); // Revert on error
        }
    };

    const toggleFavorite = async () => {
        // Optimistic update
        setIsFavorite(!isFavorite);
        try {
            // await api.post('/favorites/toggle', { movie_id: movie.id });
            console.log("Toggled favorite for", movie.id);
        } catch (err) {
            setIsFavorite(!isFavorite); // Revert on error
        }
    };

    // Use enriched details if available, otherwise fallback to initial movie prop
    const d = details?.details || movie;
    const recs = details?.recommendations || [];

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] overflow-y-auto bg-[#050505] hide-scrollbar"
        >
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
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight"
                    >
                        {d.title}
                    </motion.h1>

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
                            className={`p-3 rounded-xl border transition flex items-center justify-center ${inWatchlist ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                            title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                            {inWatchlist ? <Check size={24} /> : <Plus size={24} />}
                        </button>

                        <button
                            onClick={toggleFavorite}
                            className={`p-3 rounded-xl border transition flex items-center justify-center ${isFavorite ? 'bg-pink-500/20 border-pink-500 text-pink-500' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
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
                                <GlassCard key={m.id} movie={m} onClick={() => {
                                    if (onSwitchMovie) {
                                        onSwitchMovie(m);
                                    }
                                }} />
                            )) : <p className="text-gray-500">No recommendations available.</p>}
                        </div>
                    </section>
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
        </motion.div>
    );
}

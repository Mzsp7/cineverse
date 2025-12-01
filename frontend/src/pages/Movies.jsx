import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Star, Calendar, Search } from 'lucide-react';
import api from '../api';
import { GlassCard } from '../components/GlassCard';
import { MovieDetail } from '../components/MovieDetail';
import { Navbar } from '../components/Navbar';

export default function Movies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [filters, setFilters] = useState({
        sort_by: 'popularity.desc',
        with_genres: '',
        year: ''
    });

    const genres = [
        { id: 28, name: "Action" },
        { id: 35, name: "Comedy" },
        { id: 18, name: "Drama" },
        { id: 878, name: "Sci-Fi" },
        { id: 27, name: "Horror" },
        { id: 10749, name: "Romance" },
        { id: 53, name: "Thriller" },
        { id: 16, name: "Animation" },
        { id: 12, name: "Adventure" },
        { id: 14, name: "Fantasy" }
    ];

    useEffect(() => {
        // Load user preferences first
        const loadPrefs = async () => {
            try {
                const res = await api.get('/user/preferences');
                if (res.data.preferred_genres && res.data.preferred_genres.length > 0) {
                    setFilters(prev => ({ ...prev, with_genres: res.data.preferred_genres.join(',') }));
                }
            } catch (e) {
                console.error("No prefs found", e);
            }
        };
        loadPrefs();
    }, []);

    useEffect(() => {
        fetchMovies();
    }, [filters]);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const params = { ...filters };
            // Clean up empty params
            if (!params.year) delete params.year;
            if (!params.with_genres) delete params.with_genres;

            const res = await api.get('/discover/movies', { params });
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleGenre = (id) => {
        const current = filters.with_genres ? filters.with_genres.split(',') : [];
        const strId = String(id);
        let newGenres;
        if (current.includes(strId)) {
            newGenres = current.filter(g => g !== strId);
        } else {
            newGenres = [...current, strId];
        }
        setFilters({ ...filters, with_genres: newGenres.join(',') });
    };

    return (
        <div className="min-h-screen bg-[#050505]">
            <Navbar />

            <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            Movies
                        </h1>
                        <p className="text-gray-400 mt-2">Discover new favorites based on your taste.</p>
                    </div>

                    <div className="flex gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                        <select
                            value={filters.sort_by}
                            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                            className="bg-transparent text-sm text-gray-300 focus:outline-none px-2"
                        >
                            <option value="popularity.desc">Most Popular</option>
                            <option value="vote_average.desc">Top Rated</option>
                            <option value="primary_release_date.desc">Newest</option>
                        </select>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {genres.map(g => (
                            <button
                                key={g.id}
                                onClick={() => toggleGenre(g.id)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition ${filters.with_genres.includes(String(g.id))
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {g.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid - Optimized for more content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {movies.map((movie) => (
                            <GlassCard
                                key={movie.id}
                                item={movie}
                                onClick={() => setSelectedMovie(movie)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No movies found. Try adjusting your filters.</p>
                    </div>
                )}

                {selectedMovie && (
                    <MovieDetail
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                        onSwitchMovie={setSelectedMovie}
                    />
                )}
            </div>
        </div>
    );
}

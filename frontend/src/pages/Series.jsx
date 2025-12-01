import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Star, Calendar, Search } from 'lucide-react';
import api from '../api';
import { GlassCard } from '../components/GlassCard';
import { MovieDetail } from '../components/MovieDetail';
import { Navbar } from '../components/Navbar';

export default function Series() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [filters, setFilters] = useState({
        sort_by: 'popularity.desc',
        with_genres: '',
        year: ''
    });

    const genres = [
        { id: 10759, name: "Action & Adventure" },
        { id: 35, name: "Comedy" },
        { id: 18, name: "Drama" },
        { id: 10765, name: "Sci-Fi & Fantasy" },
        { id: 9648, name: "Mystery" },
        { id: 16, name: "Animation" },
        { id: 99, name: "Documentary" },
        { id: 10751, name: "Family" },
        { id: 10762, name: "Kids" },
        { id: 10764, name: "Reality" }
    ];

    useEffect(() => {
        fetchSeries();
    }, [filters]);

    const fetchSeries = async () => {
        setLoading(true);
        try {
            const params = { ...filters };
            if (!params.year) delete params.year;
            if (!params.with_genres) delete params.with_genres;

            const res = await api.get('/discover/series', { params });
            setSeries(res.data);
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
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                            TV Series
                        </h1>
                        <p className="text-gray-400 mt-2">Binge-worthy shows curated for you.</p>
                    </div>

                    <div className="flex gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                        <select
                            value={filters.sort_by}
                            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                            className="bg-transparent text-sm text-gray-300 focus:outline-none px-2"
                        >
                            <option value="popularity.desc">Most Popular</option>
                            <option value="vote_average.desc">Top Rated</option>
                            <option value="first_air_date.desc">Newest</option>
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
                                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
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
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : series.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {series.map((item) => (
                            <GlassCard
                                key={item.id}
                                item={item}
                                onClick={() => setSelectedSeries(item)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No series found. Try adjusting your filters.</p>
                    </div>
                )}

                {selectedSeries && (
                    <MovieDetail
                        movie={selectedSeries}
                        onClose={() => setSelectedSeries(null)}
                        onSwitchMovie={setSelectedSeries}
                    />
                )}
            </div>
        </div>
    );
}

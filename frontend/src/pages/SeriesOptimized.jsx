import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { CardSkeletonGrid } from '../components/CardSkeleton';
import { MovieDetail } from '../components/MovieDetail';
import { useSeries } from '../hooks/useSeries';
import { useDebounce } from '../hooks/useDebounce';
import { SERIES_GENRES, ITEMS_PER_PAGE } from '../utils/constants';

/**
 * Optimized Series Page
 * - Uses custom hook with caching
 * - Debounced filters
 * - Pagination
 * - Skeleton loaders
 */
export default function Series() {
    const [filters, setFilters] = useState({
        sort_by: 'popularity.desc',
        with_genres: '',
        year: ''
    });
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [page, setPage] = useState(1);

    const debouncedFilters = useDebounce(filters, 300);
    const { data: series, loading, error } = useSeries(debouncedFilters);

    const paginatedSeries = useMemo(() =>
        series.slice(0, page * ITEMS_PER_PAGE),
        [series, page]
    );

    const hasMore = paginatedSeries.length < series.length;

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
        setPage(1);
    };

    const handleSortChange = (sort_by) => {
        setFilters({ ...filters, sort_by });
        setPage(1);
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
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="bg-transparent text-sm text-gray-300 focus:outline-none px-2"
                        >
                            <option value="popularity.desc">Most Popular</option>
                            <option value="vote_average.desc">Top Rated</option>
                            <option value="first_air_date.desc">Newest</option>
                        </select>
                    </div>
                </div>

                <div className="mb-8 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {SERIES_GENRES.map(g => (
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

                {error && (
                    <div className="text-center py-20">
                        <p className="text-red-400 text-lg">Failed to load series. Please try again.</p>
                    </div>
                )}

                {loading && !series.length ? (
                    <CardSkeletonGrid count={ITEMS_PER_PAGE} />
                ) : null}

                {!loading && !error && paginatedSeries.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {paginatedSeries.map((item) => (
                                <MovieCard
                                    key={item.id}
                                    item={item}
                                    onClick={setSelectedSeries}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                ) : null}

                {!loading && !error && paginatedSeries.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No series found. Try adjusting your filters.</p>
                    </div>
                ) : null}

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

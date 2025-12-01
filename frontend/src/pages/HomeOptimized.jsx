import React, { useEffect, useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { CardSkeletonGrid } from '../components/CardSkeleton';
import { SmartSearchBar } from '../components/SmartSearchBar';
import { MovieDetailOptimized } from '../components/MovieDetailOptimized';
import { OnboardingModal } from '../components/OnboardingModal';
import api from '../api';
import { apiCache, getCacheKey } from '../utils/cache';

/**
 * Optimized Home Page
 * - Cached API responses
 * - Memoized discovery mix
 * - Optimized components
 * - Skeleton loaders
 */
export default function HomeOptimized() {
    const [data, setData] = useState({ sections: [] });
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const cacheKey = getCacheKey('/home');

            // Check cache first
            if (apiCache.has(cacheKey)) {
                setData(apiCache.get(cacheKey));
                setLoading(false);

                // Still check preferences
                checkPreferences();
                return;
            }

            try {
                // Check preferences first
                await checkPreferences();

                const res = await api.get('/home');
                setData(res.data);
                apiCache.set(cacheKey, res.data);
            } catch (err) {
                console.error("Failed to fetch home data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const checkPreferences = async () => {
        try {
            const prefRes = await api.get('/user/preferences');
            if (!prefRes.data.country && !prefRes.data.preferred_genres?.length) {
                setShowOnboarding(true);
            }
        } catch (err) {
            console.error("Failed to check preferences", err);
        }
    };

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        // Clear cache to refetch with new preferences
        apiCache.clear();
        window.location.reload();
    };

    // Memoize discovery mix to prevent recreation on every render
    const discoveryMix = useMemo(() => {
        if (!data.sections.length) return [];

        return [
            ...(data.sections[0]?.data || []).slice(0, 6),
            ...(data.sections[1]?.data || []).slice(0, 6),
        ].sort(() => Math.random() - 0.5);
    }, [data.sections]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <Navbar />
                <main className="pt-32 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto space-y-24">
                    <section className="text-center space-y-8">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                Discover Cinema
                            </span>
                            <br />
                            <span className="text-cyan-400 neon-glow text-4xl md:text-6xl">Reimagined.</span>
                        </h1>
                    </section>
                    <CardSkeletonGrid count={12} />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto space-y-24">
                {/* Hero / Search Section */}
                <section className="text-center space-y-8 relative z-20">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            Discover Cinema
                        </span>
                        <br />
                        <span className="text-cyan-400 neon-glow text-4xl md:text-6xl">Reimagined.</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Experience the next generation of movie discovery.
                        Powered by AI, designed for cinephiles.
                    </p>

                    <SmartSearchBar onResultClick={setSelectedMovie} />
                </section>

                {/* Discovery Grid */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-white">Trending Now</h2>
                        <div className="h-[1px] flex-1 bg-white/10 ml-8"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {discoveryMix.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />
                        ))}
                    </div>
                </section>

                {/* Horizontal Sections */}
                {data.sections.slice(2).map((section, idx) => (
                    <section key={idx} className="relative">
                        <h2 className="text-2xl font-bold mb-6 text-gray-200 pl-2 border-l-4 border-cyan-400">
                            {section.title}
                        </h2>
                        <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
                            {section.data.map(movie => (
                                <div key={movie.id} className="min-w-[200px] md:min-w-[240px] snap-start">
                                    <MovieCard movie={movie} onClick={setSelectedMovie} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* Movie Detail Modal */}
            {selectedMovie && (
                <MovieDetailOptimized
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    onSwitchMovie={setSelectedMovie}
                />
            )}

            {/* Onboarding Modal */}
            <OnboardingModal
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                onComplete={handleOnboardingComplete}
            />
        </div>
    );
}

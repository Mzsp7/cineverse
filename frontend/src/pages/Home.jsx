import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../api';
import { GlassCard } from '../components/GlassCard';
import { MasonryGrid } from '../components/MasonryGrid';
import { SmartSearchBar } from '../components/SmartSearchBar';
import { MovieDetail } from '../components/MovieDetail';
import { Navbar } from '../components/Navbar';
import { OnboardingModal } from '../components/OnboardingModal';

export default function Home() {
    const [data, setData] = useState({ sections: [] });
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check preferences first
                const prefRes = await api.get('/user/preferences');
                if (!prefRes.data.country && !prefRes.data.preferred_genres?.length) {
                    setShowOnboarding(true);
                }

                const res = await api.get('/home');
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch home data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        // Optionally refetch home data if it depends on preferences
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full" />
        </div>
    );

    // Flatten data for the "Discovery" masonry grid (mix of trending & popular)
    const discoveryMix = [
        ...(data.sections[0]?.data || []).slice(0, 6),
        ...(data.sections[1]?.data || []).slice(0, 6),
    ].sort(() => Math.random() - 0.5);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
            <Navbar onLogout={handleLogout} onMovieClick={setSelectedMovie} />

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
                    <MasonryGrid
                        items={discoveryMix}
                        columns={4}
                        renderItem={(movie) => (
                            <GlassCard movie={movie} onClick={setSelectedMovie} />
                        )}
                    />
                </section>

                {/* Horizontal Sections (Modernized) */}
                {data.sections.slice(2).map((section, idx) => (
                    <section key={idx} className="relative">
                        <h2 className="text-2xl font-bold mb-6 text-gray-200 pl-2 border-l-4 border-cyan-400">
                            {section.title}
                        </h2>
                        <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
                            {section.data.map(movie => (
                                <div key={movie.id} className="min-w-[200px] md:min-w-[240px] snap-start">
                                    <GlassCard movie={movie} onClick={setSelectedMovie} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

            </main>

            <AnimatePresence>
                {selectedMovie && (
                    <MovieDetail
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                        onSwitchMovie={setSelectedMovie}
                    />
                )}
            </AnimatePresence>

            <OnboardingModal
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                onComplete={handleOnboardingComplete}
            />
        </div>
    );
}

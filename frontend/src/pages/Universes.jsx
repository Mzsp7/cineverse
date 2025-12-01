import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, Globe } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import api from '../api';

const UNIVERSES = [
    { id: 'mcu', name: 'Marvel Cinematic Universe', image: 'https://image.tmdb.org/t/p/original/8rfl8i9ddBDXyAilJu8pyYfnbZu.jpg', color: 'from-red-600 to-red-900' },
    { id: 'dceu', name: 'DC Universe', image: 'https://image.tmdb.org/t/p/original/nJG6Y5b5C3cKad36j96YdCJscCg.jpg', color: 'from-blue-600 to-blue-900' },
    { id: 'harry_potter', name: 'Wizarding World', image: 'https://image.tmdb.org/t/p/original/hziiv14OpD73u9gAak4XDDfBKa2.jpg', color: 'from-yellow-600 to-yellow-900' },
    { id: 'star_wars', name: 'Star Wars', image: 'https://image.tmdb.org/t/p/original/db32LaOibwEliAmSL2jjDF6oDdj.jpg', color: 'from-yellow-500 to-gray-900' },
    { id: 'spy_universe', name: 'Spy Universe (India)', image: 'https://image.tmdb.org/t/p/original/7bWXj1u2XPXp38ePU0bUv3rI84i.jpg', color: 'from-orange-600 to-orange-900' },
    { id: 'cop_universe', name: 'Cop Universe (India)', image: 'https://image.tmdb.org/t/p/original/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', color: 'from-yellow-600 to-red-900' },
    { id: 'bts', name: 'BTS World', image: 'https://image.tmdb.org/t/p/original/wRnbWt44nKjsFPrqSmwYki5vZ0f.jpg', color: 'from-purple-600 to-purple-900' },
];

export default function Universes() {
    const [selectedUniverse, setSelectedUniverse] = useState(null);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleUniverseClick = async (universe) => {
        setSelectedUniverse(universe);
        setLoading(true);
        try {
            const res = await api.get(`/universe/${universe.id}`);
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto">

                <AnimatePresence mode='wait'>
                    {!selectedUniverse ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-16">
                                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                    Cinematic Universes
                                </h1>
                                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                    Explore the biggest franchises and interconnected worlds from across the globe.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {UNIVERSES.map((universe) => (
                                    <motion.div
                                        key={universe.id}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleUniverseClick(universe)}
                                        className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-white/5"
                                    >
                                        <div className="absolute inset-0">
                                            <img
                                                src={universe.image}
                                                alt={universe.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className={`absolute inset-0 bg-gradient-to-t ${universe.color} opacity-60 group-hover:opacity-40 transition-opacity`} />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
                                        </div>

                                        <div className="absolute bottom-0 left-0 p-8 w-full">
                                            <h3 className="text-3xl font-bold text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                {universe.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-white/80 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                <span>Explore Universe</span>
                                                <Sparkles size={16} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <button
                                onClick={() => setSelectedUniverse(null)}
                                className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
                            >
                                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Universes
                            </button>

                            <div className="flex items-end gap-6 mb-12">
                                <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${selectedUniverse.color} flex items-center justify-center shadow-2xl`}>
                                    <Globe size={48} className="text-white/80" />
                                </div>
                                <div>
                                    <h1 className="text-5xl font-bold mb-2">{selectedUniverse.name}</h1>
                                    <p className="text-gray-400">Discover all movies in this collection</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {movies.map(movie => (
                                        <div key={movie.id} className="group cursor-pointer">
                                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-lg">
                                                <img
                                                    src={movie.poster_url}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium border border-white/20">
                                                        View Details
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="font-medium truncate group-hover:text-cyan-400 transition-colors">{movie.title}</h3>
                                            <p className="text-sm text-gray-500">{movie.release_date?.split('-')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

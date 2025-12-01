import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Film } from 'lucide-react';
import api from '../api';
import { GlassCard } from './GlassCard';

export function PersonDetail({ person, onClose }) {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCredits = async () => {
            if (!person) return;
            setLoading(true);
            try {
                const res = await api.get(`/person/${person.id}/credits`);
                setCredits(res.data);
            } catch (err) {
                console.error("Failed to fetch credits", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCredits();
    }, [person]);

    if (!person) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#141414] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative hide-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left: Image & Info */}
                    <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-white/5">
                        <div className="w-48 h-72 rounded-xl overflow-hidden shadow-2xl mb-6">
                            {person.profile_url ? (
                                <img src={person.profile_url} alt={person.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <span className="text-gray-500">No Image</span>
                                </div>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 text-center md:text-left">{person.name}</h2>
                        <p className="text-purple-400 font-medium mb-4">{person.known_for_department}</p>
                    </div>

                    {/* Right: Credits */}
                    <div className="w-full md:w-2/3 p-6 md:p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Film className="text-purple-500" /> Known For
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {credits.map(movie => (
                                    <div key={movie.id} className="group relative">
                                        <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                                            <img
                                                src={movie.poster_url}
                                                alt={movie.title}
                                                className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                                            />
                                        </div>
                                        <h4 className="text-sm font-medium text-white truncate">{movie.title}</h4>
                                        <p className="text-xs text-gray-400">{movie.role || "Actor"}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

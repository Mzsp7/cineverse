import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Globe, Film, Tv, Trophy } from 'lucide-react';
import api from '../api';

export function OnboardingModal({ isOpen, onClose, onComplete }) {
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        country: 'US',
        state: '',
        content_types: [],
        preferred_genres: []
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
        { id: 99, name: "Documentary" },
        { id: 10751, name: "Family" }
    ];

    const contentTypes = [
        { id: 'movie', name: 'Movies', icon: Film },
        { id: 'series', name: 'Series', icon: Tv },
        { id: 'sports', name: 'Sports', icon: Trophy }
    ];

    const handleSave = async () => {
        try {
            await api.put('/user/preferences', preferences);
            onComplete();
            onClose();
        } catch (err) {
            console.error("Failed to save preferences", err);
        }
    };

    const toggleGenre = (id) => {
        const strId = String(id);
        setPreferences(prev => {
            const current = prev.preferred_genres || [];
            if (current.includes(strId)) {
                return { ...prev, preferred_genres: current.filter(g => g !== strId) };
            } else {
                return { ...prev, preferred_genres: [...current, strId] };
            }
        });
    };

    const toggleType = (id) => {
        setPreferences(prev => {
            const current = prev.content_types || [];
            if (current.includes(id)) {
                return { ...prev, content_types: current.filter(t => t !== id) };
            } else {
                return { ...prev, content_types: [...current, id] };
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-6 md:p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome to CineVerse</h2>
                        <p className="text-gray-400">Let's personalize your experience.</p>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Where are you located?</label>
                                <select
                                    value={preferences.country}
                                    onChange={(e) => setPreferences({ ...preferences, country: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                                >
                                    <option value="US">United States</option>
                                    <option value="IN">India</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="CA">Canada</option>
                                    <option value="AU">Australia</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">What do you like to watch?</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {contentTypes.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => toggleType(type.id)}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition ${preferences.content_types.includes(type.id)
                                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <type.icon size={24} />
                                            <span className="text-sm font-medium">{type.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition mt-4"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-4">Select your favorite genres</label>
                                <div className="flex flex-wrap gap-3">
                                    {genres.map(genre => (
                                        <button
                                            key={genre.id}
                                            onClick={() => toggleGenre(genre.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${preferences.preferred_genres.includes(String(genre.id))
                                                ? 'bg-cyan-500 text-white border-cyan-500'
                                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {genre.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
                                >
                                    Start Watching
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

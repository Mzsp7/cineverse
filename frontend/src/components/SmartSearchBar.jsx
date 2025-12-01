import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Loader, ChevronRight, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export function SmartSearchBar({ onResultClick }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [intent, setIntent] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showLanguagePrompt, setShowLanguagePrompt] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const debounceRef = useRef(null);

    // Languages to offer
    const LANGUAGES = [
        { code: 'hi', label: 'Hindi' },
        { code: 'en', label: 'English' },
        { code: 'ta', label: 'Tamil' },
        { code: 'te', label: 'Telugu' },
        { code: 'any', label: 'Any Language' }
    ];

    const handleSearchInput = (e) => {
        setQuery(e.target.value);
        setResults(null);
        setShowLanguagePrompt(false);
        setSelectedLanguage(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.length > 2) {
            // Instead of searching, ask for language first
            setShowLanguagePrompt(true);
            setIsFocused(true);
        }
    };

    const executeSearch = async (langCode) => {
        setLoading(true);
        setShowLanguagePrompt(false);

        let finalQuery = query;
        let langLabel = 'Any';

        if (langCode && langCode !== 'any') {
            langLabel = LANGUAGES.find(l => l.code === langCode)?.label;
            finalQuery = `${query} in ${langLabel}`;
        }

        try {
            // 1. Get Search Results
            const res = await api.get(`/search/smart?query=${finalQuery}`);
            const searchResults = res.data.results;
            const searchIntent = res.data.intent;

            setIntent(searchIntent);

            // 2. Get "CineVerse Recommends" (System Picks)
            // We'll pick top rated movies from the same results or fetch new ones if we had genre info
            // For now, let's sort the search results by rating to find "Gems"
            const sortedByRating = [...searchResults].sort((a, b) => b.vote_average - a.vote_average);

            // Filter out movies that are already in the top 3 search results to avoid duplicates
            const top3Ids = new Set(searchResults.slice(0, 3).map(m => m.id));
            const recommendations = sortedByRating
                .filter(m => !top3Ids.has(m.id))
                .slice(0, 3); // Take top 3 high-rated ones as recommendations

            setResults({
                matches: searchResults.slice(0, 5), // Top 5 direct matches
                picks: recommendations // Top 3 system picks
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageSelect = (langCode) => {
        setSelectedLanguage(langCode);
        executeSearch(langCode);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto z-50">
            <div
                className={`relative flex items-center glass-panel rounded-2xl px-6 py-4 transition-all duration-300 ${isFocused ? 'ring-2 ring-cyan-400/50 shadow-[0_0_30px_rgba(0,242,234,0.2)]' : ''}`}
            >
                {loading ? (
                    <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
                ) : (
                    <Sparkles className={`w-6 h-6 ${selectedLanguage ? 'text-green-400' : 'text-purple-400'}`} />
                )}

                <input
                    type="text"
                    value={query}
                    onChange={handleSearchInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    // Delay blur to allow clicking on dropdown items
                    onBlur={() => setTimeout(() => {
                        if (!showLanguagePrompt) setIsFocused(false);
                    }, 200)}
                    placeholder="Ask for 'sad 90s movies' or 'sci-fi'..."
                    className="w-full bg-transparent border-none outline-none text-lg text-white ml-4 placeholder-gray-500 font-medium"
                />

                {query.length > 2 && !loading && !showLanguagePrompt && !results && (
                    <button
                        onClick={() => setShowLanguagePrompt(true)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                    >
                        <ChevronRight size={20} className="text-cyan-400" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {/* Language Selection Prompt */}
                {showLanguagePrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full mt-4 glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-2xl z-50"
                    >
                        <div className="flex items-center gap-3 mb-4 text-cyan-400">
                            <Languages size={20} />
                            <h3 className="font-semibold">Which language do you prefer?</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 transition-all text-sm font-medium text-gray-300 hover:text-white"
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Results Dropdown */}
                {isFocused && !showLanguagePrompt && (results?.matches || intent) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full mt-4 glass-panel rounded-2xl overflow-hidden max-h-[70vh] overflow-y-auto shadow-2xl"
                    >
                        {/* AI Intent Badge */}
                        {intent && intent.type === 'recommendation' && (
                            <div className="p-4 bg-purple-500/10 border-b border-purple-500/20 flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-400" />
                                <span className="text-sm text-purple-200">
                                    Top picks for <span className="text-white font-bold">"{intent.keywords}"</span>
                                    {selectedLanguage && <span className="text-green-400 ml-1">({LANGUAGES.find(l => l.code === selectedLanguage)?.label})</span>}
                                </span>
                            </div>
                        )}

                        <div className="p-2 space-y-4">
                            {/* Direct Matches */}
                            <div>
                                <h5 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Your Matches</h5>
                                {results?.matches?.map(movie => (
                                    <MovieResultItem key={movie.id} movie={movie} onClick={onResultClick} />
                                ))}
                            </div>

                            {/* System Recommendations */}
                            {results?.picks?.length > 0 && (
                                <div className="border-t border-white/10 pt-2">
                                    <h5 className="px-3 py-2 text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles size={12} /> CineVerse Recommends
                                    </h5>
                                    {results.picks.map(movie => (
                                        <MovieResultItem key={movie.id} movie={movie} onClick={onResultClick} isHighlight={true} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MovieResultItem({ movie, onClick, isHighlight }) {
    return (
        <div
            onClick={() => onClick(movie)}
            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors group ${isHighlight ? 'hover:bg-cyan-500/10 bg-cyan-500/5' : 'hover:bg-white/5'}`}
        >
            <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform"
            />
            <div>
                <h4 className={`font-semibold ${isHighlight ? 'text-cyan-100' : 'text-white'}`}>{movie.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span className="text-yellow-400 flex items-center gap-1">
                        <span className="text-[10px]">★</span> {movie.vote_average?.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{movie.release_date?.split('-')[0]}</span>
                    {movie.original_language && (
                        <span className="uppercase border border-white/10 px-1 rounded text-[10px]">
                            {movie.original_language}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

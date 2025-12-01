import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Filter, User, Film } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { MovieDetail } from '../components/MovieDetail';
import { Navbar } from '../components/Navbar';
import api from '../api';

export default function Recommendations() {
    const [activeTab, setActiveTab] = useState('smart'); // 'smart', 'actor', 'director'
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [intent, setIntent] = useState(null);

    // Person search state
    const [personQuery, setPersonQuery] = useState('');
    const [personResults, setPersonResults] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);

    // Filters for smart search
    const [filters, setFilters] = useState({
        genre: '',
        minRating: 5,
        year: ''
    });

    const searchSmart = async () => {
        if (!query) return;
        setLoading(true);
        setResults([]);
        setIntent(null);
        try {
            const res = await api.get(`/search/smart?query=${query}`);
            setResults(res.data.results);
            setIntent(res.data.intent);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const searchPerson = async (q) => {
        if (!q) {
            setPersonResults([]);
            return;
        }
        try {
            const res = await api.get(`/search/person?query=${q}`);
            setPersonResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPersonCredits = async (person) => {
        setSelectedPerson(person);
        setPersonQuery(''); // Clear search
        setPersonResults([]); // Clear dropdown
        setLoading(true);
        try {
            const res = await api.get(`/person/${person.id}/credits`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Debounce person search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab !== 'smart' && personQuery.length > 2) {
                searchPerson(personQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [personQuery, activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
            <Navbar onLogout={handleLogout} />
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
                        Curated For You
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Discover your next obsession using AI or explore by your favorite creators.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => { setActiveTab('smart'); setResults([]); }}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'smart' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Sparkles size={16} /> AI Search
                        </button>
                        <button
                            onClick={() => { setActiveTab('actor'); setResults([]); }}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'actor' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <User size={16} /> By Actor
                        </button>
                        <button
                            onClick={() => { setActiveTab('director'); setResults([]); }}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'director' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Film size={16} /> By Director
                        </button>
                    </div>
                </div>

                {/* Search Area */}
                <div className="max-w-2xl mx-auto mb-12 relative z-20">
                    {activeTab === 'smart' ? (
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchSmart()}
                                placeholder="Describe what you want to watch (e.g. 'sad 90s movies')..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-14 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-xl"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <button
                                onClick={searchSmart}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition"
                            >
                                <Sparkles size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                value={personQuery}
                                onChange={(e) => setPersonQuery(e.target.value)}
                                placeholder={`Search for a ${activeTab}...`}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-14 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-xl"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />

                            {/* Person Dropdown */}
                            {personResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                                    {personResults.map(person => (
                                        <button
                                            key={person.id}
                                            onClick={() => fetchPersonCredits(person)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition text-left border-b border-white/5 last:border-0"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                                {person.profile_url ? (
                                                    <img src={person.profile_url} alt={person.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-full h-full p-2 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{person.name}</div>
                                                <div className="text-xs text-gray-500">{person.known_for_department}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected Person Header */}
                {selectedPerson && activeTab !== 'smart' && (
                    <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 max-w-2xl mx-auto">
                        <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                            {selectedPerson.profile_url && (
                                <img src={selectedPerson.profile_url} alt={selectedPerson.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{selectedPerson.name}</h2>
                            <p className="text-gray-400 text-sm">Showing top movies & series</p>
                        </div>
                        <button
                            onClick={() => { setSelectedPerson(null); setResults([]); }}
                            className="ml-auto text-gray-400 hover:text-white"
                        >
                            Change
                        </button>
                    </div>
                )}

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map((movie) => (
                            <GlassCard
                                key={movie.id}
                                item={movie}
                                onClick={() => setSelectedMovie(movie)}
                            />
                        ))}
                    </div>
                ) : (
                    !loading && (query || selectedPerson) && (
                        <div className="text-center py-20 text-gray-500">
                            <Sparkles className="mx-auto mb-4 opacity-50" size={48} />
                            <p>No results found. Try a different search.</p>
                        </div>
                    )
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
    const [movie, setMovie] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getRecommendations = async (e) => {
        e.preventDefault();
        if (!movie.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await api.post('/recommend', { movie_name: movie });
            setRecommendations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Navbar */}
            <nav className="p-6 flex justify-between items-center bg-gray-800 shadow-md">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    CineVerse
                </h1>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white transition">
                    Logout
                </button>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 flex flex-col items-center">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-center">
                    Find Your Next Favorite Movie
                </h2>

                <form onSubmit={getRecommendations} className="w-full max-w-2xl flex gap-4 mb-12">
                    <input
                        type="text"
                        placeholder="Enter a movie you like (e.g. Avatar)"
                        className="flex-1 p-4 rounded-lg bg-gray-800 border border-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={movie}
                        onChange={(e) => setMovie(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 disabled:opacity-50"
                    >
                        {loading ? 'Thinking...' : 'Recommend'}
                    </button>
                </form>

                {/* Results */}
                <div className="w-full max-w-5xl">
                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.map((rec) => (
                                <div key={rec.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition duration-300 shadow-lg group">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400">{rec.title_x}</h3>
                                    <p className="text-gray-400 text-sm mb-2">
                                        {rec.release_date ? rec.release_date.split('-')[0] : 'N/A'} • {rec.vote_average}/10
                                    </p>
                                    <p className="text-gray-500 text-xs line-clamp-3">{rec.overview}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        searched && !loading && (
                            <div className="text-center text-gray-500 text-xl">
                                No movies found similar to "{movie}". Try another title!
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import api from '../api';

export function MovieModal({ movie, onClose }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (movie) {
            fetchRecommendations();
        }
    }, [movie]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            // We use the custom recommendation endpoint which uses our ML model
            const res = await api.post('/recommend', { movie_name: movie.title });
            setRecommendations(res.data);
        } catch (err) {
            console.error("Failed to get recs", err);
        } finally {
            setLoading(false);
        }
    };

    if (!movie) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#181818] w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-white/20 transition"
                >
                    ✕
                </button>

                <div className="relative h-[40vh] md:h-[50vh]">
                    <img
                        src={movie.backdrop_url || movie.poster_url}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8">
                        <h2 className="text-4xl font-bold text-white mb-2">{movie.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                            <span className="text-green-400 font-bold">{Math.round(movie.vote_average * 10)}% Match</span>
                            <span>{movie.release_date?.split('-')[0]}</span>
                            <span className="border border-gray-500 px-1 text-xs rounded">HD</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            {movie.overview}
                        </p>
                    </div>
                    <div className="text-gray-400 text-sm">
                        <div className="mb-4">
                            <span className="block text-gray-500 mb-1">Genres:</span>
                            <span className="text-white">
                                {movie.genres?.join(', ') || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Similar Movies Section */}
                <div className="p-8 border-t border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4">More Like This</h3>
                    {loading ? (
                        <div className="text-gray-500">Finding similar movies...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {recommendations.length > 0 ? recommendations.map(rec => (
                                <div key={rec.id} className="bg-[#2f2f2f] rounded p-2 hover:bg-[#3f3f3f] transition cursor-pointer">
                                    <div className="aspect-video mb-2 overflow-hidden rounded">
                                        <img src={rec.backdrop_url || rec.poster_url} className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="text-gray-200 text-sm font-medium truncate">{rec.title}</h4>
                                    <p className="text-gray-500 text-xs">{rec.release_date?.split('-')[0]}</p>
                                </div>
                            )) : (
                                <div className="text-gray-500 col-span-full">No recommendations found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

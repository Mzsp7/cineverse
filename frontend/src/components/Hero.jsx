import React from 'react';

export function Hero({ movie, onPlay, onMoreInfo }) {
    if (!movie) return null;

    return (
        <div className="relative h-[70vh] w-full">
            <div className="absolute inset-0">
                <img
                    src={movie.backdrop_url || movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3 lg:w-1/2">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                    {movie.title}
                </h1>
                <p className="text-lg text-gray-200 mb-6 line-clamp-3 drop-shadow-md">
                    {movie.overview}
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => onMoreInfo(movie)}
                        className="bg-gray-500/70 hover:bg-gray-500/90 text-white px-8 py-3 rounded flex items-center gap-2 transition backdrop-blur-sm"
                    >
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
}

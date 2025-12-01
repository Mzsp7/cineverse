import React, { useRef } from 'react';

export function MovieRow({ title, movies, onMovieClick }) {
    const rowRef = useRef(null);

    const scroll = (offset) => {
        if (rowRef.current) {
            rowRef.current.scrollLeft += offset;
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <div className="mb-8 px-4 md:px-12 group">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 hover:text-blue-400 transition cursor-pointer">
                {title}
            </h2>

            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll(-300)}
                    className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition h-full w-12 flex items-center justify-center"
                >
                    ‹
                </button>

                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie) => (
                        <div
                            key={movie.id}
                            onClick={() => onMovieClick(movie)}
                            className="flex-none w-[160px] md:w-[200px] transition duration-300 transform hover:scale-105 cursor-pointer"
                        >
                            <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800">
                                <img
                                    src={movie.poster_url || "https://via.placeholder.com/300x450?text=No+Image"}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-300 truncate">{movie.title}</h3>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll(300)}
                    className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition h-full w-12 flex items-center justify-center"
                >
                    ›
                </button>
            </div>
        </div>
    );
}

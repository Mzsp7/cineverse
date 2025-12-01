import React, { useCallback } from 'react';
import { Play, Star } from 'lucide-react';

/**
 * Optimized Movie Card Component
 * - Memoized to prevent unnecessary re-renders
 * - Reduced animations for better scroll performance
 * - Lazy image loading
 * - Stable event handlers with useCallback
 */
export const MovieCard = React.memo(({ movie, item, onClick, className = '', aspect = 'poster' }) => {
    // Support both 'movie' and 'item' props for backwards compatibility
    const data = movie || item;

    const handleClick = useCallback(() => {
        if (onClick && data) {
            onClick(data);
        }
    }, [onClick, data]);

    if (!data) return null;

    return (
        <div
            className={`glass-card group cursor-pointer relative transition-transform hover:scale-105 ${className}`}
            onClick={handleClick}
        >
            {/* Image Layer */}
            <div className={`w-full overflow-hidden rounded-t-xl ${aspect === 'video' ? 'aspect-video' : 'aspect-[2/3]'}`}>
                <img
                    src={aspect === 'video' ? (data.backdrop_url || data.poster_url) : data.poster_url}
                    alt={data.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* Content Layer */}
            <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold text-base md:text-lg leading-tight line-clamp-2 mb-1 drop-shadow-lg">
                    {data.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {data.vote_average && (
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star size={12} fill="currentColor" />
                            <span>{data.vote_average.toFixed(1)}</span>
                        </div>
                    )}
                    {data.release_date && (
                        <span>{data.release_date.split('-')[0]}</span>
                    )}
                    {data.genres && data.genres.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                            {data.genres[0]}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px] rounded-xl">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-300">
                    <Play size={20} className="ml-1 text-white" />
                </div>
            </div>
        </div>
    );
});

MovieCard.displayName = 'MovieCard';

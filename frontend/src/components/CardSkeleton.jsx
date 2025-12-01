import React from 'react';

/**
 * Skeleton loader for movie/series cards
 * Provides better perceived performance than spinners
 */
export function CardSkeleton() {
    return (
        <div className="glass-card overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="w-full aspect-[2/3] bg-white/5" />

            {/* Content skeleton */}
            <div className="p-4 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
        </div>
    );
}

/**
 * Grid of skeleton cards
 */
export function CardSkeletonGrid({ count = 20 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

// Genre mappings for movies and series
export const MOVIE_GENRES = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 878, name: "Sci-Fi" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 53, name: "Thriller" },
    { id: 16, name: "Animation" },
    { id: 12, name: "Adventure" },
    { id: 14, name: "Fantasy" }
];

export const SERIES_GENRES = [
    { id: 10759, name: "Action & Adventure" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 9648, name: "Mystery" },
    { id: 16, name: "Animation" },
    { id: 99, name: "Documentary" },
    { id: 10751, name: "Family" },
    { id: 10762, name: "Kids" },
    { id: 10764, name: "Reality" }
];

// Pagination
export const ITEMS_PER_PAGE = 20;

// Cache TTL
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Debounce delays
export const SEARCH_DEBOUNCE_MS = 500;
export const FILTER_DEBOUNCE_MS = 300;

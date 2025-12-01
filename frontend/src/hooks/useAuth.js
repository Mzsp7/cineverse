import { useState, useEffect, useCallback } from 'react';
import api from '../api';

/**
 * Authentication hook - manages user state and profile
 * Centralizes auth logic to prevent redundant profile fetches
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/user/profile');
            setUser(res.data);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setError(err.message);
            // Don't clear token here - let interceptor handle it
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('adminSession'); // Clear admin session
            setUser(null);
            window.location.href = '/login';
        }
    }, []);

    const getUserInitials = useCallback(() => {
        if (!user?.full_name) return 'U';
        const names = user.full_name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return user.full_name.substring(0, 2).toUpperCase();
    }, [user]);

    return {
        user,
        loading,
        error,
        logout,
        getUserInitials,
        refetch: fetchUserProfile
    };
}

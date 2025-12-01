import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Heart, ListPlus, Sparkles, Settings, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = React.memo(() => {
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    // Use centralized auth hook - prevents redundant API calls
    const { user, logout, getUserInitials } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleLogout = async () => {
        await logout();
        setDropdownOpen(false);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Memoize nav links to prevent recreation on every render
    const navLinks = useMemo(() => [
        { to: '/', label: 'Home', icon: null },
        { to: '/recommendations', label: 'For You', icon: Sparkles },
        { to: '/movies', label: 'Movies', icon: null },
        { to: '/series', label: 'Series', icon: null },
        { to: '/universes', label: 'Universes', icon: Globe }
    ], []);


    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${scrolled ? 'bg-[#050505]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
            <div className="flex items-center gap-12">
                <Link to="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer hover:opacity-80 transition">
                    CineVerse
                </Link>
                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    {navLinks.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`hover:text-cyan-400 transition relative group flex items-center gap-2 ${location.pathname === to ? 'text-cyan-400' : ''}`}
                        >
                            {Icon && <Icon size={16} className="text-purple-400" />}
                            {label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-6">
                {token ? (
                    <>
                        <Link to="/watchlist" className="hidden md:block text-gray-300 hover:text-cyan-400 transition" title="My Watchlist">
                            <ListPlus className="w-5 h-5" />
                        </Link>
                        <Link to="/favorites" className="hidden md:block text-gray-300 hover:text-pink-500 transition" title="My Favorites">
                            <Heart className="w-5 h-5" />
                        </Link>
                        <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={toggleDropdown}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20 text-sm hover:scale-110 transition-transform cursor-pointer"
                                title="Click to open menu"
                            >
                                {getUserInitials()}
                            </div>
                            {dropdownOpen && (
                                <div className="absolute top-full right-0 mt-4 w-56 glass-panel rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-fadeIn">
                                    <div className="p-4 border-b border-white/5">
                                        <p className="text-sm text-white font-medium truncate">{user?.full_name || 'User'}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                                        {user?.city && user?.country && (
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                {user.city}, {user.country}
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        to="/manage-account"
                                        onClick={() => setDropdownOpen(false)}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition"
                                    >
                                        <Settings className="w-4 h-4" /> Manage Account
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2 transition"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition backdrop-blur-sm">
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
});

Navbar.displayName = 'Navbar';


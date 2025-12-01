import React from 'react';
import { Navbar } from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderPage({ title }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
            <Navbar onLogout={handleLogout} />

            {/* Background Grain */}
            <div className="absolute inset-0 bg-[url('/grain.svg')] opacity-20 pointer-events-none"></div>

            <div className="flex flex-col items-center justify-center h-screen relative z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6">
                    {title}
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    This feature is currently under development. Stay tuned for updates!
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition backdrop-blur-md"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}

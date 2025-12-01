import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/token', formData);
            localStorage.setItem('token', response.data.access_token);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-bg relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grain.svg')] opacity-20 pointer-events-none"></div>
            <div className="glass-panel p-8 rounded-2xl shadow-2xl w-96 relative z-10">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>
                {error && <p className="text-red-400 text-sm mb-4 text-center bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-primary text-white placeholder-gray-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-primary text-white placeholder-gray-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3 rounded-xl transition duration-200 shadow-[0_0_20px_rgba(0,242,234,0.3)]">
                        Login
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-400 text-sm">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

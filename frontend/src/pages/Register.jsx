import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Globe, MapPin, Loader } from 'lucide-react';
import api from '../api';

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        country: '',
        state: '',
        city: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const countries = [
        'United States', 'India', 'United Kingdom', 'Canada', 'Australia',
        'Germany', 'France', 'Japan', 'Brazil', 'Mexico', 'Other'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error on input change
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Backend expects 'full_name' in snake_case
            await api.post('/register', {
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                country: formData.country,
                state: formData.state,
                city: formData.city
            });
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Registration failed. Email might be taken or invalid data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505] relative overflow-hidden py-12 px-4">
            <div className="absolute inset-0 bg-[url('/grain.svg')] opacity-20 pointer-events-none"></div>

            <div className="glass-panel p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">Join CineVerse</h2>
                    <p className="text-gray-400">Create your account to get personalized recommendations</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    name="full_name"
                                    placeholder="John Doe"
                                    className="w-full p-3 pl-10 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    className="w-full p-3 pl-10 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Min. 8 characters"
                                className="w-full p-3 pl-10 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="pt-4 border-t border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Globe className="text-cyan-400" size={20} />
                            Location (Optional)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Country
                                </label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white transition"
                                >
                                    <option value="">Select Country</option>
                                    {countries.map(c => (
                                        <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    State/Region
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="California"
                                    className="w-full p-3 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    City
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="Los Angeles"
                                        className="w-full p-3 pl-10 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={18} />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account? <Link to="/login" className="text-cyan-400 hover:underline font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
}

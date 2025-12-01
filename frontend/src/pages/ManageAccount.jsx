import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Globe, Save, Loader } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import api from '../api';

export default function ManageAccount() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        country: '',
        state: '',
        city: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const countries = [
        'United States', 'India', 'United Kingdom', 'Canada', 'Australia',
        'Germany', 'France', 'Japan', 'Brazil', 'Mexico', 'Other'
    ];

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await api.get('/user/profile');
            setUser(res.data);
            setFormData({
                full_name: res.data.full_name || '',
                email: res.data.email || '',
                country: res.data.country || '',
                state: res.data.state || '',
                city: res.data.city || ''
            });
        } catch (err) {
            console.error('Failed to fetch user data', err);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/user/profile', formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Refresh user data
            await fetchUserData();
        } catch (err) {
            console.error('Failed to update profile', err);
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader className="animate-spin text-cyan-400" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="pt-32 pb-20 px-4 md:px-12 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                        Manage Account
                    </h1>
                    <p className="text-gray-400">Update your personal information and preferences</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/50 text-green-400'
                            : 'bg-red-500/10 border-red-500/50 text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <User className="text-cyan-400" size={20} />
                            Personal Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition"
                                    placeholder="Enter your full name"
                                />
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
                                        value={formData.email}
                                        disabled
                                        className="w-full p-3 pl-10 bg-white/5 rounded-xl border border-white/10 text-gray-500 cursor-not-allowed"
                                        placeholder="Email cannot be changed"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Globe className="text-cyan-400" size={20} />
                            Location
                        </h2>

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
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition"
                                    placeholder="Enter state or region"
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
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full p-3 pl-10 bg-white/5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500 transition"
                                        placeholder="Enter your city"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

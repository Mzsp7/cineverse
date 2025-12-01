import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Globe, Shield, Search, AlertCircle } from 'lucide-react';
import api from '../api';
import { Navbar } from '../components/Navbar';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Admin access denied", err);
            // Redirect to admin login if access denied
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
            <div className="text-center p-8 glass-panel rounded-2xl border border-red-500/30">
                <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-gray-400">{error}</p>
                <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition">
                    Return Home
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Monitor platform performance and manage users</p>
                    </div>
                    <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium flex items-center gap-2">
                        <Shield size={16} /> Admin Mode Active
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Users}
                        label="Total Users"
                        value={stats?.total_users || 0}
                        trend="+12% this week"
                        color="blue"
                    />
                    <StatCard
                        icon={Activity}
                        label="Active Sessions"
                        value={stats?.active_sessions || 0}
                        trend="Live now"
                        color="green"
                    />
                    <StatCard
                        icon={Globe}
                        label="Countries"
                        value={stats?.top_countries?.length || 0}
                        trend="Global reach"
                        color="purple"
                    />
                    <StatCard
                        icon={Search}
                        label="Total Searches"
                        value="1,245"
                        trend="+5% today"
                        color="orange"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* User List */}
                    <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Registered Users</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition w-48"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-sm">
                                    <tr>
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Location</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-white/5 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">
                                                        {user.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{user.full_name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-300">
                                                {user.city ? `${user.city}, ${user.country}` : user.country || 'Unknown'}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-gray-400 hover:text-white transition text-sm">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Regional Distribution */}
                    <div className="glass-panel rounded-2xl border border-white/10 p-6">
                        <h3 className="text-xl font-bold mb-6">User Distribution</h3>
                        <div className="space-y-4">
                            {stats?.top_countries?.map((country, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300 flex items-center gap-2">
                                            {getFlagEmoji(country.name)} {country.name}
                                        </span>
                                        <span className="font-medium">{country.count} users</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                            style={{ width: `${(country.count / stats.total_users) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, trend, color }) {
    const colors = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        green: "text-green-400 bg-green-500/10 border-green-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    {trend}
                </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-gray-400 text-sm">{label}</p>
        </div>
    );
}

function getFlagEmoji(countryCode) {
    // Simple mapper or fallback
    const flags = {
        "India": "🇮🇳", "United States": "🇺🇸", "United Kingdom": "🇬🇧",
        "Canada": "🇨🇦", "Australia": "🇦🇺", "Germany": "🇩🇪",
        "France": "🇫🇷", "Japan": "🇯🇵", "Brazil": "🇧🇷"
    };
    return flags[countryCode] || "🌍";
}

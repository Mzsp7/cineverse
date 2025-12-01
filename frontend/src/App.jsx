import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/HomeOptimized';
import PlaceholderPage from './pages/PlaceholderPage';
import Recommendations from './pages/RecommendationsOptimized';
import Movies from './pages/MoviesOptimized';
import Series from './pages/SeriesOptimized';
import ManageAccount from './pages/ManageAccount';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Universes from './pages/Universes';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const isAdminSession = localStorage.getItem('adminSession');

    // Strict check: Must have token AND be in an admin session
    return (token && isAdminSession) ? children : <Navigate to="/admin/login" />;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Home />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/recommendations"
                        element={
                            <PrivateRoute>
                                <Recommendations />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/movies"
                        element={
                            <PrivateRoute>
                                <Movies />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/series"
                        element={
                            <PrivateRoute>
                                <Series />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/universes"
                        element={
                            <PrivateRoute>
                                <Universes />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/manage-account"
                        element={
                            <PrivateRoute>
                                <ManageAccount />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/watchlist"
                        element={
                            <PrivateRoute>
                                <PlaceholderPage title="My Watchlist" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <PrivateRoute>
                                <PlaceholderPage title="Favorites" />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sports"
                        element={
                            <PrivateRoute>
                                <PlaceholderPage title="Sports" />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin Route */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

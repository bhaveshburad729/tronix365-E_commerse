import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User, LogOut, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const LIMIT = 5; // Smaller limit for user dashboard

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('tronix_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch Profile and Initial Orders concurrently
                const [profileRes, ordersRes] = await Promise.all([
                    client.get('/profile'),
                    client.get(`/orders/user?skip=0&limit=${LIMIT}`)
                ]);

                setUser(profileRes.data);
                setOrders(ordersRes.data);
                if (ordersRes.data.length < LIMIT) setHasMore(false);

            } catch (error) {
                console.error("Dashboard error:", error);

                // If 401, token might be invalid
                if (error.response && error.response.status === 401) {
                    toast.error("Session expired. Please login again.");
                    localStorage.removeItem('tronix_token');
                    localStorage.removeItem('tronix_user');
                    navigate('/login');
                } else {
                    toast.error("Failed to load dashboard data");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const nextSkip = page * LIMIT;
            const res = await client.get(`/orders/user?skip=${nextSkip}&limit=${LIMIT}`);
            const newOrders = res.data;

            setOrders(prev => [...prev, ...newOrders]);
            setPage(prev => prev + 1);
            if (newOrders.length < LIMIT) setHasMore(false);
        } catch (error) {
            toast.error("Failed to load more orders");
        } finally {
            setLoadingMore(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('tronix_token');
        localStorage.removeItem('tronix_user');
        window.location.href = '/login';
    };

    if (loading) {
        return <div className="min-h-screen pt-24 text-center text-white">Loading dashboard...</div>;
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-tronix-bg">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 space-y-4">
                        <div className="bg-tronix-card border border-white/10 rounded-xl p-6 text-center">
                            <div className="w-20 h-20 bg-tronix-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-tronix-primary">
                                    {user?.full_name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
                            <p className="text-gray-400 text-sm">{user?.email}</p>
                        </div>

                        <div className="bg-tronix-card border border-white/10 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <Package size={20} /> My Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <User size={20} /> Profile Details
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-6 py-4 text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'orders' ? (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
                                {orders.length === 0 ? (
                                    <div className="bg-tronix-card border border-white/10 rounded-xl p-8 text-center">
                                        <Package size={48} className="mx-auto text-gray-500 mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                                        <button
                                            onClick={() => navigate('/shop')}
                                            className="text-tronix-primary hover:text-white transition-colors"
                                        >
                                            Start shopping
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-tronix-card border border-white/10 rounded-xl overflow-hidden">
                                                <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/5">
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-400">Order ID</p>
                                                        <p className="font-mono text-white">#{order.id}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-400">Date</p>
                                                        <p className="text-white">Now</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-400">Total Amount</p>
                                                        <p className="font-bold text-tronix-accent">₹{order.total_amount}</p>
                                                    </div>
                                                    <div>
                                                        <span className={`px-3 py-1 rounded-full text-xs uppercase font-bold flex items-center gap-1 ${order.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            order.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-yellow-500/20 text-yellow-400'
                                                            }`}>
                                                            {order.status === 'confirmed' && <CheckCircle size={12} />}
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                                                                <Package size={20} className="text-gray-500" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-white font-medium">Product ID: {item.product_id}</p>
                                                                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {hasMore && (
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    onClick={handleLoadMore}
                                                    disabled={loadingMore}
                                                    className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                                                >
                                                    {loadingMore ? 'Loading...' : 'Load Older Orders'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-tronix-card border border-white/10 rounded-xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                                <div className="grid grid-cols-1 gap-6 max-w-xl">
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={user?.full_name}
                                            disabled
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white opacity-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white opacity-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Role</label>
                                        <span className="inline-block bg-tronix-primary/20 text-tronix-primary px-3 py-1 rounded-lg text-sm uppercase font-bold">
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

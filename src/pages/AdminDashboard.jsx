import React, { useState } from 'react';
import { Package, Users, DollarSign, TrendingUp, Plus, Image as ImageIcon, Search } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
                        <p className="text-tronix-muted">Manage your inventory, orders and analytics.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-tronix-accent text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                            <Plus size={18} /> Add Product
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: 'Total Revenue', value: '₹12,45,000', icon: DollarSign, color: 'text-emerald-500' },
                        { title: 'Total Orders', value: '1,245', icon: Package, color: 'text-violet-500' },
                        { title: 'Active Users', value: '890', icon: Users, color: 'text-purple-500' },
                        { title: 'Growth', value: '+24.5%', icon: TrendingUp, color: 'text-orange-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-tronix-card border border-white/5 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400 text-sm">{stat.title}</span>
                                <stat.icon className={`${stat.color}`} size={20} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-tronix-card border border-white/5 rounded-xl overflow-hidden min-h-[500px]">
                    <div className="border-b border-white/5 p-4 flex items-center justify-between">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Products
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Orders
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tronix-primary"
                            />
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Mock Table */}
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-white uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4 rounded-l-lg">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                                    <ImageIcon size={16} />
                                                </div>
                                                <span className="font-medium text-white">Arduino Uno R3</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">Development Boards</td>
                                        <td className="px-6 py-4 text-white">₹450.00</td>
                                        <td className="px-6 py-4">150</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs">In Stock</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

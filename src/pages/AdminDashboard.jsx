import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Package, Users, DollarSign, TrendingUp, Plus, Image as ImageIcon, Search, X, Check } from 'lucide-react';
import { products as mockProducts } from '../data/mockData';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Timeout promise for the entire batch
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), 2000)
                );

                const fetchPromise = Promise.all([
                    fetch('http://localhost:8000/products'),
                    fetch('http://localhost:8000/orders')
                ]);

                const [productsRes, ordersRes] = await Promise.race([fetchPromise, timeoutPromise]);

                if (!productsRes.ok || !ordersRes.ok) {
                    throw new Error('Failed to fetch data from server');
                }

                const productsData = await productsRes.json();
                const ordersData = await ordersRes.json();

                setProducts(Array.isArray(productsData) ? productsData : []);
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                // Fallback to mock data for presentation
                setProducts(mockProducts);
                // Mock orders for demo if backend fails
                setOrders([
                    { id: 1001, customer_email: 'demo@user.com', items: [{}, {}], total_amount: 540, status: 'confirmed' },
                    { id: 1002, customer_email: 'test@user.com', items: [{}], total_amount: 120, status: 'pending' }
                ]);
                setError(null); // Clear error to show dashboard with mock data
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Add Product Modal State
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '', category: 'Development Boards', price: '', description: '', image: ''
    });

    const handleAddProduct = (e) => {
        e.preventDefault();
        const product = { ...newProduct, id: products.length + 1 };
        setProducts([...products, product]);
        setIsAddProductOpen(false);
        setNewProduct({ title: '', category: 'Development Boards', price: '', description: '', image: '' });
        toast.success('Product added successfully');
    };

    // Calculate Stats
    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum, order) => sum + order.total_amount, 0) : 0;
    const totalOrders = Array.isArray(orders) ? orders.length : 0;
    // Mock user count for now or fetch if we had users endpoint
    const activeUsers = 890;

    if (loading) {
        return <div className="min-h-screen pt-24 text-center text-white">Loading dashboard...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 text-center text-red-500">
                <p>Error: {error}</p>
                <p className="text-gray-400 text-sm mt-2">Make sure the backend server is running on port 8000.</p>
            </div>
        );
    }

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
                        <button
                            onClick={() => setIsAddProductOpen(true)}
                            className="flex items-center gap-2 bg-tronix-accent text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            <Plus size={18} /> Add Product
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
                        { title: 'Total Orders', value: totalOrders, icon: Package, color: 'text-violet-500' },
                        { title: 'Active Users', value: activeUsers, icon: Users, color: 'text-purple-500' },
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
                        {activeTab === 'products' ? (
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-white uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4 rounded-l-lg">Product</th>
                                        <th className="px-6 py-4">SKV</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {products.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-medium text-white">{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 font-mono text-xs">{item.skv || 'N/A'}</td>
                                            <td className="px-6 py-4">{item.category}</td>
                                            <td className="px-6 py-4 text-white">₹{item.sale_price || item.price}</td>
                                            <td className="px-6 py-4">{item.stock}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs">In Stock</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-white uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4 rounded-l-lg">Order ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Items</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {orders.map((order, index) => (
                                        <tr key={index} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white">#{order.id || 1000 + index}</td>
                                            <td className="px-6 py-4">{order.customer_email}</td>
                                            <td className="px-6 py-4">{order.items.length} Items</td>
                                            <td className="px-6 py-4 text-white">₹{order.total_amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs uppercase ${order.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                                                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            {/* Add Product Modal */}
            {isAddProductOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-tronix-card border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setIsAddProductOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-display font-bold text-white mb-6">Add New Product</h2>

                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Product Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newProduct.title}
                                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tronix-primary outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tronix-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        value={newProduct.stock || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tronix-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Category</label>
                                <select
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tronix-primary outline-none"
                                >
                                    <option>Development Boards</option>
                                    <option>Sensors</option>
                                    <option>Modules</option>
                                    <option>Motors</option>
                                    <option>Battery</option>
                                    <option>Displays</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={newProduct.image}
                                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tronix-primary outline-none"
                                    />
                                    <button type="button" className="bg-white/10 px-3 rounded-lg hover:bg-white/20 transition-colors">
                                        <ImageIcon size={20} className="text-gray-300" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tronix-primary outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-tronix-primary hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                            >
                                Create Product
                            </button>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default AdminDashboard;

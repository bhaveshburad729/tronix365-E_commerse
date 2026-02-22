import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Package, Users, DollarSign, TrendingUp, Plus, Image as ImageIcon, Search, X, Check, Edit, Trash2, Loader, Tag, Info, List, Save, Boxes, Calendar, CreditCard, Clock, MapPin, User, Truck } from 'lucide-react';
import { products as mockProducts } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { getImageUrl } from '../utils/imageUtils';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [stats, setStats] = useState({ total_revenue: 0, total_orders: 0, total_products: 0, active_users: 0, growth: 0 });

    // Data States
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');

    const filteredProducts = products.filter(p =>
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.skv && p.skv.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.id && o.id.toString().includes(searchQuery.toLowerCase())) ||
            (o.customer_email && o.customer_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.status && o.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.full_name && o.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = orderStatusFilter === 'All' ||
            (o.status && o.status.toLowerCase() === orderStatusFilter.toLowerCase());

        return matchesSearch && matchesStatus;
    });

    // Pagination States
    const [productsPage, setProductsPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const [hasMoreOrders, setHasMoreOrders] = useState(true);
    const LIMIT = 10;

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Initial Load
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch Stats
                const statsRes = await client.get('/admin/stats');
                setStats(statsRes.data);

                // Fetch Initial Products
                const prodRes = await client.get(`/products?skip=0&limit=${LIMIT}`);
                setProducts(prodRes.data);
                if (prodRes.data.length < LIMIT) setHasMoreProducts(false);

                // Fetch Initial Orders
                const ordRes = await client.get(`/orders?skip=0&limit=${LIMIT}`);
                setOrders(ordRes.data);
                if (ordRes.data.length < LIMIT) setHasMoreOrders(false);

            } catch (error) {
                console.error('Error fetching admin data:', error);
                // Fallback to mock/zeros if backend fails (graceful degradation)
                setError("Failed to load dashboard data. Ensure backend is running.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            if (activeTab === 'products') {
                const nextSkip = productsPage * LIMIT;
                const res = await client.get(`/products?skip=${nextSkip}&limit=${LIMIT}`);
                const newItems = res.data;

                setProducts(prev => [...prev, ...newItems]);
                setProductsPage(prev => prev + 1);
                if (newItems.length < LIMIT) setHasMoreProducts(false);
            } else {
                const nextSkip = ordersPage * LIMIT;
                const res = await client.get(`/orders?skip=${nextSkip}&limit=${LIMIT}`);
                const newItems = res.data;

                setOrders(prev => [...prev, ...newItems]);
                setOrdersPage(prev => prev + 1);
                if (newItems.length < LIMIT) setHasMoreOrders(false);
            }
        } catch (err) {
            toast.error("Failed to load more items");
        } finally {
            setLoadingMore(false);
        }
    };

    // Add/Edit Product Modal State
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // Track if editing
    const [newProduct, setNewProduct] = useState({
        title: '', category: 'Development Boards', price: '', mrp: '', description: '', image: '', features: ''
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setNewProduct({ title: '', category: 'Development Boards', price: '', mrp: '', description: '', image: '', features: '' });
        setIsAddProductOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setNewProduct({
            ...product,
            features: product.features && Array.isArray(product.features) ? product.features.join('\n') : ''
        }); // Pre-fill form
        setIsAddProductOpen(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newProduct };
            if (typeof payload.features === 'string') {
                payload.features = payload.features.split('\n').map(f => f.trim()).filter(f => f);
            }

            if (editingProduct) {
                // Update existing
                const res = await client.put(`/products/${editingProduct.id}`, payload);
                setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
                toast.success('Product updated successfully');
            } else {
                // Create new
                const res = await client.post('/products', payload);
                setProducts([res.data, ...products]);
                toast.success('Product added successfully');
            }
            setIsAddProductOpen(false);
            setNewProduct({ title: '', category: 'Development Boards', price: '', mrp: '', description: '', image: '', features: '' });
        } catch (error) {
            console.error("Save product error:", error);
            toast.error('Failed to save product');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const res = await client.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setNewProduct({ ...newProduct, image: res.data.url });
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await client.delete(`/products/${productToDelete.id}`);
            setProducts(products.filter(p => p.id !== productToDelete.id));
            toast.success('Product deleted successfully');
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (error) {
            console.error("Delete product error:", error);
            toast.error('Failed to delete product');
        }
    };

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
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-2 bg-tronix-accent text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            <Plus size={18} /> Add Product
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
                        { title: 'Total Orders', value: stats.total_orders, icon: Package, color: 'text-violet-500' },
                        { title: 'Active Users', value: stats.active_users, icon: Users, color: 'text-purple-500' },
                        {
                            title: 'Monthly Growth',
                            value: `${stats.growth > 0 ? '+' : ''}${stats.growth || 0}%`,
                            icon: TrendingUp,
                            color: stats.growth >= 0 ? 'text-emerald-500' : 'text-red-500'
                        },
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
                <div className="bg-tronix-card border border-white/5 rounded-xl overflow-hidden min-h-[500px] flex flex-col">
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
                                placeholder="Search products or orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tronix-primary w-64 transition-all focus:w-72"
                            />
                        </div>
                    </div>

                    <div className="p-6 flex-1">
                        {activeTab === 'products' ? (
                            <>
                                <table className="w-full text-left text-sm text-gray-400 mb-4">
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
                                        {filteredProducts.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                                                            <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="font-medium text-white">{item.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 font-mono text-xs">{item.skv || 'N/A'}</td>
                                                <td className="px-6 py-4">{item.category}</td>
                                                <td className="px-6 py-4 text-white">₹{item.sale_price || item.price}</td>
                                                <td className="px-6 py-4">{item.stock}</td>
                                                <td className="px-6 py-4">
                                                    {item.stock > 0 ? (
                                                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-medium">In Stock</span>
                                                    ) : (
                                                        <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-medium">Out of Stock</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditModal(item)}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item)}
                                                        className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                    No products found matching "{searchQuery}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {hasMoreProducts && (
                                    <div className="flex justify-center mt-4">
                                        <button onClick={loadMore} disabled={loadingMore} className="text-tronix-primary hover:underline disabled:opacity-50">
                                            {loadingMore ? 'Loading...' : 'Load More Products'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Order Status Tabs */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {['All', 'pending', 'confirmed', 'shipped'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setOrderStatusFilter(status)}
                                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${orderStatusFilter === status
                                                ? 'bg-violet-500 text-white border border-violet-400'
                                                : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 hover:text-white'
                                                }`}
                                        >
                                            {status === 'All' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4 mb-6">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order, index) => (
                                            <div
                                                key={index}
                                                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                                            >
                                                {/* Left Margin Accent Line */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.status === 'confirmed' ? 'bg-green-500' :
                                                    order.status === 'pending' ? 'bg-yellow-500' :
                                                        'bg-blue-500'
                                                    }`}></div>

                                                {/* Left section: ID & Email & Date */}
                                                <div className="flex items-center gap-4 pl-2">
                                                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400 shrink-0">
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                                                            Order #order_tronix_{String(order.id).padStart(4, '0')}
                                                            <span className="text-xs font-normal text-gray-500 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                                <Calendar size={12} />
                                                                {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                            </span>
                                                        </h3>
                                                        <p className="text-gray-400 text-sm mt-0.5">{order.full_name || order.customer_email}</p>
                                                    </div>
                                                </div>

                                                {/* Middle section: Stats */}
                                                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 sm:ml-auto mr-4">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Total Amount</p>
                                                        <p className="text-emerald-400 font-bold sm:text-lg leading-tight">₹{order.total_amount.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Items</p>
                                                        <p className="text-white font-medium sm:text-lg leading-tight">{Array.isArray(order.items) ? order.items.length : 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
                                                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${order.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right Action Button */}
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 group-hover:bg-violet-500/20 group-hover:text-violet-300 group-hover:border-violet-500/30"
                                                >
                                                    <Search size={16} className="opacity-70" />
                                                    <span>View Details</span>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 px-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search size={24} className="text-gray-500" />
                                            </div>
                                            <h3 className="text-lg font-medium text-white mb-1">No Orders Found</h3>
                                            <p className="text-gray-400 text-sm">We couldn't find any orders matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                                {hasMoreOrders && (
                                    <div className="flex justify-center mt-4">
                                        <button onClick={loadMore} disabled={loadingMore} className="text-tronix-primary hover:underline disabled:opacity-50">
                                            {loadingMore ? 'Loading...' : 'Load More Orders'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Add/Edit Product Modal */}
            <AnimatePresence>
                {isAddProductOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddProductOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative w-full max-w-4xl bg-tronix-card border border-white/10 rounded-2xl shadow-2xl shadow-violet-500/10 flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-tronix-primary/20 flex items-center justify-center border border-tronix-primary/30">
                                        {editingProduct ? <Edit className="text-tronix-primary w-5 h-5" /> : <Plus className="text-tronix-primary w-5 h-5" />}
                                    </div>
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <button
                                    onClick={() => setIsAddProductOpen(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Form Body - Scrollable */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <form id="product-form" onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                    {/* Left Column - Main Details */}
                                    <div className="lg:col-span-8 space-y-5">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Info size={16} /> Basic Information
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1.5 pl-1">Product Title</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                        <Tag size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Arduino Uno R3"
                                                        value={newProduct.title}
                                                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary focus:bg-white/5 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 pl-1">Category</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                            <Boxes size={18} />
                                                        </div>
                                                        <select
                                                            value={newProduct.category}
                                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary focus:bg-white/5 transition-all outline-none appearance-none"
                                                        >
                                                            <option className="bg-tronix-card text-white">Development Boards</option>
                                                            <option className="bg-tronix-card text-white">Sensors</option>
                                                            <option className="bg-tronix-card text-white">Modules</option>
                                                            <option className="bg-tronix-card text-white">Motors</option>
                                                            <option className="bg-tronix-card text-white">Battery</option>
                                                            <option className="bg-tronix-card text-white">Displays</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 pl-1 flex items-center justify-between">
                                                        <span>Stock Quantity</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProduct({ ...newProduct, stock: 0 })}
                                                            className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded-md transition-colors"
                                                        >
                                                            Out of Stock
                                                        </button>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                            <Package size={18} />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            required
                                                            placeholder="0"
                                                            value={newProduct.stock === 0 ? 0 : newProduct.stock || ''}
                                                            onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary focus:bg-white/5 transition-all outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <List size={16} /> Details & Features
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1.5 pl-1">Description</label>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Detailed description of the product..."
                                                    value={newProduct.description}
                                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary focus:bg-white/5 transition-all outline-none resize-none custom-scrollbar"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1.5 pl-1 flex items-center justify-between">
                                                    <span>Features</span>
                                                    <span className="text-xs text-gray-500 font-normal">One per line</span>
                                                </label>
                                                <textarea
                                                    rows="4"
                                                    placeholder="e.g. Wi-Fi Enabled&#10;Bluetooth 5.0&#10;Rechargeable Battery"
                                                    value={newProduct.features}
                                                    onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary focus:bg-white/5 transition-all outline-none resize-none custom-scrollbar font-mono text-sm leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Pricing & Media */}
                                    <div className="lg:col-span-4 space-y-5">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <DollarSign size={16} /> Pricing
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 pl-1">MRP (₹)</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                            ₹
                                                        </div>
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={newProduct.mrp || ''}
                                                            onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value ? Number(e.target.value) : '' })}
                                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-600 focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary focus:bg-white/5 transition-all outline-none text-lg font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 pl-1">Sale Price (₹)</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
                                                            ₹
                                                        </div>
                                                        <input
                                                            type="number"
                                                            required
                                                            placeholder="0.00"
                                                            value={newProduct.price}
                                                            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                                            className="w-full bg-black/20 border border-emerald-500/30 rounded-xl pl-8 pr-4 py-3 text-emerald-400 placeholder-emerald-900/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-emerald-500/5 transition-all outline-none text-lg font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <ImageIcon size={16} /> Media
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1.5 pl-1">Product Image</label>

                                                {/* Image Preview Block */}
                                                <div className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-white/10 mb-3 bg-black/20 flex flex-col items-center justify-center relative overflow-hidden group">
                                                    {newProduct.image ? (
                                                        <>
                                                            <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-md transition-colors flex items-center gap-2 font-medium shadow-xl"
                                                                    disabled={uploading}
                                                                >
                                                                    <Edit size={18} /> Change Image
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                                                                <ImageIcon className="text-gray-400 w-6 h-6" />
                                                            </div>
                                                            <p className="text-sm text-gray-400 mb-3">No image selected</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="bg-tronix-primary/20 hover:bg-tronix-primary/30 text-tronix-primary border border-tronix-primary/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium mx-auto text-sm"
                                                                disabled={uploading}
                                                            >
                                                                <Plus size={16} /> Upload Image
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Upload Overlay */}
                                                    {uploading && (
                                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
                                                            <Loader className="w-8 h-8 text-tronix-primary animate-spin mb-2" />
                                                            <span className="text-sm font-medium text-white">Uploading...</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />

                                                {/* Manual URL Input */}
                                                <div className="relative mt-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Or paste image URL here..."
                                                        value={newProduct.image || ''}
                                                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary focus:bg-white/5 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Sticky Footer */}
                            <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-xl flex justify-end gap-3 rounded-b-2xl mt-auto shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                                <button
                                    type="button"
                                    onClick={() => setIsAddProductOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-gray-300 font-medium hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="product-form"
                                    className="bg-tronix-primary hover:bg-violet-600 text-white font-bold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-tronix-card border border-white/10 rounded-2xl w-full max-w-sm p-6 relative text-center">
                        <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="text-red-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Product?</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete <span className="text-white font-medium">{productToDelete?.title}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteProduct}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative w-full max-w-4xl bg-tronix-card border border-white/10 rounded-2xl shadow-2xl shadow-violet-500/10 flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                                            <Package className="text-violet-400 w-5 h-5" />
                                        </div>
                                        Order Details
                                    </h2>
                                    <p className="text-gray-400 mt-1 ml-14 text-sm">Order ID: #order_tronix_{String(selectedOrder.id).padStart(4, '0')} • {selectedOrder.customer_email}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body - Scrollable */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                                {/* Status Pipeline Stepper */}
                                <div className="bg-black/20 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-blue-500/20"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        {['pending', 'confirmed', 'shipped'].map((step, idx, arr) => {
                                            const isActive = selectedOrder.status === step || arr.indexOf(selectedOrder.status) > idx;
                                            const isCurrent = selectedOrder.status === step;
                                            return (
                                                <div key={step} className="flex flex-col items-center flex-1 relative">
                                                    {/* Connecting Line */}
                                                    {idx !== arr.length - 1 && (
                                                        <div className={`absolute top-5 left-[50%] right-[-50%] h-[2px] ${isActive ? 'bg-violet-500' : 'bg-white/10'}`} />
                                                    )}

                                                    {/* Step Circle */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${isActive ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/5 text-gray-500 border border-white/10'
                                                        }`}>
                                                        {isActive && !isCurrent ? <Check size={20} /> :
                                                            step === 'pending' ? <Clock size={20} /> :
                                                                step === 'confirmed' ? <Package size={20} /> : <Truck size={20} />}
                                                    </div>

                                                    {/* Step Label */}
                                                    <p className={`mt-3 text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                                        {step}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Customer & Order Info Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                                    {/* Customer Profile Card */}
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <User size={16} className="text-violet-400" /> Customer Profile
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Full Name</p>
                                                <p className="text-white font-medium text-lg">{selectedOrder.full_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email Address</p>
                                                <p className="text-gray-300">{selectedOrder.customer_email}</p>
                                            </div>
                                            {selectedOrder.phone && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Phone Number</p>
                                                    <p className="text-gray-300">{selectedOrder.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Timeline Card */}
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <CreditCard size={16} className="text-emerald-400" /> Payment & Timeline
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Transaction ID</p>
                                                <p className="text-emerald-400 font-mono text-sm bg-emerald-500/10 inline-block px-2 py-1 rounded mt-1 border border-emerald-500/20">
                                                    {selectedOrder.txnid || 'Payment Pending / COD'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order Placed On</p>
                                                <p className="text-gray-300 flex items-center gap-2 mt-1">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString(undefined, {
                                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Amount</p>
                                                <p className="text-white font-bold text-xl mt-0.5">₹{selectedOrder.total_amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                                    <div className="p-4 border-b border-white/5 bg-black/20">
                                        <h3 className="font-semibold text-white">Purchased Products</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-400">
                                            <thead className="bg-black/40 text-gray-300 uppercase font-medium text-xs">
                                                <tr>
                                                    <th className="px-6 py-4">Product</th>
                                                    <th className="px-6 py-4">SKV</th>
                                                    <th className="px-6 py-4 text-center">Qty</th>
                                                    <th className="px-6 py-4 text-right">Unit Price</th>
                                                    <th className="px-6 py-4 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                    selectedOrder.items.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                                                                        {item.product?.image ? (
                                                                            <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <ImageIcon className="text-gray-500 w-5 h-5" />
                                                                        )}
                                                                    </div>
                                                                    <span className="font-medium text-white line-clamp-2">{item.product?.title || 'Unknown Product'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-300 font-mono text-xs max-w-[120px] truncate" title={item.product?.skv}>
                                                                {item.product?.skv || 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 text-center font-bold text-white">
                                                                {item.quantity}x
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                ₹{item.price_at_purchase || 0}
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-bold text-emerald-400">
                                                                ₹{(item.price_at_purchase || 0) * item.quantity}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                            No item details available.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            {/* Order Summary Footer */}
                                            {selectedOrder.total_amount > 0 && (
                                                <tfoot className="bg-black/40 border-t border-white/10">
                                                    <tr>
                                                        <td colSpan="3"></td>
                                                        <td className="px-6 py-3 text-right text-sm text-gray-400 font-medium">Original Amount (before tax):</td>
                                                        <td className="px-6 py-3 text-right text-sm text-white font-bold">₹{(selectedOrder.total_amount / 1.18).toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="3"></td>
                                                        <td className="px-6 py-3 text-right text-sm text-gray-400 font-medium">GST (18%):</td>
                                                        <td className="px-6 py-3 text-right text-sm text-yellow-400 font-bold">₹{(selectedOrder.total_amount - (selectedOrder.total_amount / 1.18)).toFixed(2)}</td>
                                                    </tr>
                                                    <tr className="border-t border-white/10 bg-white/5">
                                                        <td colSpan="3"></td>
                                                        <td className="px-6 py-4 text-right text-sm text-white font-bold">Grand Total:</td>
                                                        <td className="px-6 py-4 text-right text-base text-emerald-400 font-black">₹{selectedOrder.total_amount.toLocaleString()}</td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div >
    );
};

export default AdminDashboard;

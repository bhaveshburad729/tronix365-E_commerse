import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Package, Users, DollarSign, TrendingUp, Plus, Image as ImageIcon, Search, X, Check, Edit, Trash2, Loader } from 'lucide-react';
import { products as mockProducts } from '../data/mockData';
import client from '../api/client';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [stats, setStats] = useState({ total_revenue: 0, total_orders: 0, total_products: 0, active_users: 0 });

    // Data States
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

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
        title: '', category: 'Development Boards', price: '', description: '', image: ''
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setNewProduct({ title: '', category: 'Development Boards', price: '', description: '', image: '' });
        setIsAddProductOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setNewProduct({ ...product }); // Pre-fill form
        setIsAddProductOpen(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                // Update existing
                const res = await client.put(`/products/${editingProduct.id}`, newProduct);
                setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
                toast.success('Product updated successfully');
            } else {
                // Create new
                const res = await client.post('/products', newProduct);
                setProducts([res.data, ...products]);
                toast.success('Product added successfully');
            }
            setIsAddProductOpen(false);
            setNewProduct({ title: '', category: 'Development Boards', price: '', description: '', image: '' });
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
                                placeholder="Search..."
                                className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tronix-primary"
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
                                <table className="w-full text-left text-sm text-gray-400 mb-4">
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
                                                <td className="px-6 py-4 text-white">#{order.id}</td>
                                                <td className="px-6 py-4">{order.customer_email}</td>
                                                <td className="px-6 py-4">{Array.isArray(order.items) ? order.items.length : 0} Items</td>
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

                        <h2 className="text-2xl font-display font-bold text-white mb-6">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <form onSubmit={handleSaveProduct} className="space-y-4">
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
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="bg-white/10 px-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center min-w-[44px]"
                                        disabled={uploading}
                                    >
                                        {uploading ? <Loader size={20} className="animate-spin text-tronix-primary" /> : <ImageIcon size={20} className="text-gray-300" />}
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
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                        </form>
                    </div>
                </div >
            )}
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
        </div >
    );
};

export default AdminDashboard;

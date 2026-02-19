import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductFilter from '../components/shop/ProductFilter';
import { categories, products as mockProducts } from '../data/mockData';
import { API_BASE_URL } from '../api/config';

const Shop = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Initialize category from URL if present
    useEffect(() => {
        if (category) {
            // Robust matching: Find the category where slugified name matches the URL param
            const targetCategory = categories.find(c =>
                c.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
            );

            if (targetCategory) {
                setSelectedCategory(targetCategory);
            } else {
                // If param doesn't match known categories, maybe it's "all" or invalid
                if (category.toLowerCase() === 'all') {
                    setSelectedCategory('All');
                }
            }
        } else {
            // If accessed via /shop, ensure 'All' is selected
            setSelectedCategory('All');
        }
    }, [category]);

    const [priceRange, setPriceRange] = useState(10000);
    const [sortBy, setSortBy] = useState('');
    const [showInStockOnly, setShowInStockOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState('');

    // Mobile Filter Drawer
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            setDebugInfo(''); // Clear previous debug
            try {
                // Build Query String
                const params = new URLSearchParams();
                const searchQuery = new URLSearchParams(window.location.search).get('search');

                // ONLY append category if it's NOT 'All'
                if (selectedCategory !== 'All') {
                    params.append('category', selectedCategory);
                }

                if (priceRange < 10000) params.append('max_price', priceRange);
                if (sortBy) params.append('sort_by', sortBy);
                if (searchQuery) params.append('search', searchQuery);

                const url = `${API_BASE_URL}/products?${params.toString()}`;
                console.log("Fetching URL:", url); // Log for console debugging

                const response = await fetch(url);

                if (response.ok) {
                    let data = await response.json();

                    // Client-side Stock Filter 
                    if (showInStockOnly) {
                        data = data.filter(p => p.stock > 0);
                    }

                    if (data.length === 0) {
                        setDebugInfo(`API returned 0 items. URL: ${url}`);
                    }

                    console.log("Fetched Products:", data);
                    setProducts(data);
                    setFilteredProducts(data);
                } else {
                    const text = await response.text();
                    setError(`API Error: ${response.status} ${response.statusText}`);
                    setDebugInfo(`URL: ${url} \n Body: ${text}`);
                    setProducts([]);
                    setFilteredProducts([]);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setError(`Network Error: ${error.message}`);
                setDebugInfo(`Config API URL: ${API_BASE_URL}`);
                setProducts([]);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce fetching to avoid too many requests while sliding price
        const timeoutId = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeoutId);

    }, [selectedCategory, priceRange, sortBy, showInStockOnly, window.location.search]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-center text-white">
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                            {new URLSearchParams(window.location.search).get('search') ? `Search Results: "${new URLSearchParams(window.location.search).get('search')}"` : 'Shop Components'}
                        </h1>
                        <p className="text-gray-400">Browse our collection of premium electronics.</p>
                    </div>

                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="md:hidden flex items-center gap-2 bg-tronix-card border border-white/10 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/5 transition-colors"
                    >
                        <Filter size={18} /> Filters
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <ProductFilter
                            categories={categories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            showInStockOnly={showInStockOnly}
                            setShowInStockOnly={setShowInStockOnly}
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {/* Debug Info (Hidden) */}
                        {/* 
                        <div className="bg-blue-500/20 border border-blue-500 text-blue-200 p-4 rounded-xl mb-6">
                            <h3 className="font-bold">Debug Info</h3>
                            <p className="font-mono text-xs whitespace-pre-wrap">{debugInfo}</p>
                            {error && <p className="text-red-400 font-bold mt-2">{error}</p>}
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                            >
                                Reload Page
                            </button>
                        </div> 
                        */}

                        {/* Product Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Filter size={48} className="mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2">No products found</h3>
                                <p>Try adjusting your search or filters.</p>
                                <button
                                    onClick={() => { setSelectedCategory('All'); setPriceRange(10000); }}
                                    className="mt-4 text-tronix-primary hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Filter Drawer */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 right-0 w-80 bg-tronix-bg border-l border-white/10 z-50 lg:hidden p-6 overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-display font-bold text-xl text-white">Filters</h3>
                                    <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-400 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>
                                <ProductFilter
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={setSelectedCategory}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    showInStockOnly={showInStockOnly}
                                    setShowInStockOnly={setShowInStockOnly}
                                />
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="w-full mt-8 bg-tronix-primary text-white font-bold py-3 rounded-xl hover:bg-violet-600 transition-colors"
                                >
                                    Show Results
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Shop;

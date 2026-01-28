import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductFilter from '../components/shop/ProductFilter';
import { categories, products as mockProducts } from '../data/mockData';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(10000);
    const [showInStockOnly, setShowInStockOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    // Mobile Filter Drawer
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Create a timeout promise that rejects after 2 seconds
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), 2000)
                );

                const fetchPromise = fetch('http://localhost:8000/products');

                // Race the fetch against the timeout
                const response = await Promise.race([fetchPromise, timeoutPromise]);

                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                    setFilteredProducts(data);
                } else {
                    throw new Error('Failed to fetch from backend');
                }
            } catch (error) {
                console.warn('Backend unavailable or slow, falling back to mock data:', error);
                setProducts(mockProducts);
                setFilteredProducts(mockProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let result = products;

        // Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(product => product.category === selectedCategory);
        }

        // Price Filter
        result = result.filter(product => product.price <= priceRange);

        // Stock Filter
        if (showInStockOnly) {
            // Future logic for stock
        }

        setFilteredProducts(result);
    }, [selectedCategory, priceRange, showInStockOnly, products]);

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
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Shop Components</h1>
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
                            showInStockOnly={showInStockOnly}
                            setShowInStockOnly={setShowInStockOnly}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
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
    );
};

export default Shop;

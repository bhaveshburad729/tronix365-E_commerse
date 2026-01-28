import React from 'react';
import { Filter, SlidersHorizontal, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductFilter = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    showInStockOnly,
    setShowInStockOnly
}) => {
    return (
        <div className="bg-tronix-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-white pb-4 border-b border-white/5">
                <SlidersHorizontal size={20} className="text-tronix-primary" />
                <h3 className="font-display font-bold text-lg">Filters</h3>
            </div>

            {/* Categories */}
            <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'All' ? 'bg-tronix-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        All Categories
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category ? 'bg-tronix-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Price Range</h4>
                    <span className="text-xs text-tronix-accent bg-tronix-accent/10 px-2 py-1 rounded">
                        ₹0 - ₹{priceRange}
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tronix-primary"
                />
            </div>

            {/* Availability */}
            <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Availability</h4>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showInStockOnly ? 'bg-tronix-primary border-tronix-primary' : 'border-gray-600 group-hover:border-gray-500'}`}>
                        {showInStockOnly && <Check size={14} className="text-white" />}
                    </div>
                    <input
                        type="checkbox"
                        checked={showInStockOnly}
                        onChange={() => setShowInStockOnly(!showInStockOnly)}
                        className="hidden"
                    />
                    <span className={`text-sm ${showInStockOnly ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>In Stock Only</span>
                </label>
            </div>
        </div>
    );
};

export default ProductFilter;

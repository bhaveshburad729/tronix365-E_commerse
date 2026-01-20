import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-tronix-card border border-white/5 rounded-2xl overflow-hidden hover:border-tronix-primary/50 transition-all duration-300 h-full flex flex-col"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden bg-white/5 p-4 flex items-center justify-center">
                <img
                    src={product.image}
                    alt={product.title}
                    className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button className="p-2 bg-white text-tronix-dark rounded-full hover:bg-tronix-primary hover:text-white transition-colors">
                        <Eye size={20} />
                    </button>
                    <button className="p-2 bg-tronix-primary text-white rounded-full hover:bg-blue-600 transition-colors">
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs text-tronix-primary font-medium mb-1">{product.category}</div>
                <h3 className="text-white font-medium text-lg leading-tight mb-2 line-clamp-2 group-hover:text-tronix-primary transition-colors">
                    {product.title}
                </h3>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-white">₹{product.price}</span>
                    <button className="text-xs text-tronix-muted hover:text-white transition-colors">
                        Add to Wishlist
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;

import React from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product.id);

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
                    <Link to={`/product/${product.id}`} className="p-2 bg-white text-tronix-dark rounded-full hover:bg-tronix-primary hover:text-white transition-colors">
                        <Eye size={20} />
                    </Link>
                    <Link to={`/product/${product.id}`} className="p-2 bg-tronix-primary text-white rounded-full hover:bg-blue-600 transition-colors">
                        <ShoppingCart size={20} />
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product);
                            alert(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist');
                        }}
                        className={`p-2 rounded-full transition-colors ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-tronix-dark hover:bg-red-500 hover:text-white'}`}
                    >
                        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs text-tronix-primary font-medium mb-1">{product.category}</div>
                <Link to={`/product/${product.id}`} className="block">
                    <h3 className="text-white font-medium text-lg leading-tight mb-2 line-clamp-2 group-hover:text-tronix-primary transition-colors">
                        {product.title}
                    </h3>
                </Link>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-white">₹{product.price}</span>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product);
                            alert(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist');
                        }}
                        className={`text-xs transition-colors flex items-center gap-1 ${isWishlisted ? 'text-red-500 hover:text-red-400' : 'text-tronix-muted hover:text-white'}`}
                    >
                        <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                        {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;

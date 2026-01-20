import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchOverlay from '../search/SearchOverlay';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-tronix-primary rounded flex items-center justify-center">
                                <span className="text-white font-display font-bold text-lg">T</span>
                            </div>
                            <span className="font-display font-bold text-xl tracking-wider text-white">
                                TRONIX<span className="text-tronix-primary">365</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-300 hover:text-tronix-primary transition-colors">Home</Link>
                            <Link to="/shop" className="text-gray-300 hover:text-tronix-primary transition-colors">Shop</Link>
                            <Link to="/categories" className="text-gray-300 hover:text-tronix-primary transition-colors">Categories</Link>
                        </div>

                        {/* Actions */}
                        <div className="hidden md:flex items-center space-x-6">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="text-gray-300 hover:text-tronix-primary transition-colors"
                            >
                                <Search size={20} />
                            </button>
                            <Link to="/wishlist" className="text-gray-300 hover:text-tronix-accent transition-colors">
                                <Heart size={20} />
                            </Link>
                            <Link to="/cart" className="relative text-gray-300 hover:text-tronix-primary transition-colors">
                                <ShoppingCart size={20} />
                                <span className="absolute -top-2 -right-2 bg-tronix-primary text-xs w-4 h-4 rounded-full flex items-center justify-center text-white">0</span>
                            </Link>
                            <Link to="/login" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all">
                                <User size={18} className="text-tronix-primary" />
                                <span className="text-sm">Login</span>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300">
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-tronix-bg/95 backdrop-blur-xl border-t border-white/10"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-2">
                                <Link to="/" className="block py-3 text-base font-medium text-white border-b border-white/5">Home</Link>
                                <Link to="/shop" className="block py-3 text-base font-medium text-gray-300 border-b border-white/5">Shop</Link>
                                <Link to="/categories" className="block py-3 text-base font-medium text-gray-300 border-b border-white/5">Categories</Link>
                                <div className="pt-4 flex items-center justify-between">
                                    <Link to="/login" className="flex items-center gap-2 text-tronix-primary">
                                        <User size={20} /> Login
                                    </Link>
                                    <div className="flex gap-4">
                                        <button onClick={() => { setIsOpen(false); setIsSearchOpen(true); }}><Search size={20} className="text-gray-300" /></button>
                                        <Heart size={20} className="text-gray-300" />
                                        <ShoppingCart size={20} className="text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    );
};

export default Navbar;

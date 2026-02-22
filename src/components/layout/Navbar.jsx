import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, ChevronDown, Bell, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';
import SearchOverlay from '../search/SearchOverlay';
import SearchBar from '../search/SearchBar';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [user, setUser] = useState(null);
    const { cartCount } = useCart();

    useEffect(() => {
        // Check local storage for user data
        const checkUser = () => {
            try {
                const storedUser = localStorage.getItem('tronix_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // Fallback for old key/format compatibility
                    const oldUser = localStorage.getItem('user');
                    if (oldUser) setUser(JSON.parse(oldUser));
                }
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        };

        checkUser();
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('tronix_token');
        localStorage.removeItem('tronix_user');
        localStorage.removeItem('user'); // Clean up old key
        localStorage.removeItem('tronix365_cart');
        localStorage.removeItem('tronix365_wishlist');
        setUser(null);
        navigate('/login'); // Use navigate to respect the basename in App.jsx
    };

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
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                                <img src={logo} alt="Tronix365 Logo" className="w-full h-full object-contain" />
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
                            <SearchBar />
                            <Link to="/wishlist" className="text-gray-300 hover:text-tronix-accent transition-colors">
                                <Heart size={20} />
                            </Link>
                            <Link to="/cart" className="relative text-gray-300 hover:text-tronix-primary transition-colors">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-tronix-primary text-xs w-5 h-5 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all">
                                        <User size={18} className="text-tronix-accent" />
                                        <span className="text-sm">{user.role === 'admin' ? 'System Manager' : (user.full_name || user.name || 'User')}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="flex items-center gap-2 bg-tronix-primary hover:bg-violet-600 px-4 py-2 rounded-full text-white text-sm font-bold transition-all shadow-lg shadow-violet-500/20">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
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
                                {user ? (
                                    <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-2">
                                        <div className="flex items-center gap-3">
                                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-tronix-primary font-medium">
                                                <User size={20} /> {user.full_name || user.name || 'User'}
                                            </Link>
                                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
                                                <LogOut size={20} />
                                            </button>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => { setIsOpen(false); setIsSearchOpen(true); }}><Search size={20} className="text-gray-300" /></button>
                                            <Link to="/wishlist"><Heart size={20} className="text-gray-300" /></Link>
                                            <Link to="/cart"><ShoppingCart size={20} className="text-gray-300" /></Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-4 space-y-3 border-t border-white/5 mt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-4">
                                                <button onClick={() => { setIsOpen(false); setIsSearchOpen(true); }}><Search size={20} className="text-gray-300" /></button>
                                                <Link to="/wishlist"><Heart size={20} className="text-gray-300" /></Link>
                                                <Link to="/cart"><ShoppingCart size={20} className="text-gray-300" /></Link>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                to="/login"
                                                onClick={() => setIsOpen(false)}
                                                className="text-center py-2 rounded-lg bg-white/5 text-white text-sm font-medium"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                to="/signup"
                                                onClick={() => setIsOpen(false)}
                                                className="text-center py-2 rounded-lg bg-tronix-primary text-white text-sm font-bold"
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav >
        </>
    );
};

export default Navbar;

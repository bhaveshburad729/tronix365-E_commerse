import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center px-4">
                <ShoppingBag size={64} className="text-gray-600 mb-6" />
                <h2 className="text-3xl font-display font-bold text-white mb-4">Your Cart is Empty</h2>
                <p className="text-gray-400 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products to find what you need.</p>
                <Link
                    to="/shop"
                    className="bg-tronix-primary text-white font-bold px-8 py-3 rounded-full hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/30"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    const handleCheckout = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const email = user ? user.email : "guest@example.com"; // Fallback or force login

            const orderData = {
                items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
                total_amount: Math.round(cartTotal * 1.18),
                customer_email: email,
                status: "pending"
            };

            const response = await fetch('http://localhost:8000/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Order placed successfully! Order ID: ${result.order_id}`);
                clearCart();
            } else {
                alert('Failed to place order.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout.');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-display font-bold text-white mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-tronix-card/50 border border-white/5 rounded-xl p-4 flex gap-4 items-center"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center p-2 shrink-0">
                                    <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium truncate">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.category}</p>
                                    <div className="mt-2 text-tronix-accent font-bold">₹{item.price}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))}

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={clearCart}
                                className="text-sm text-red-500 hover:text-red-400 hover:underline transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-tronix-card border border-white/5 rounded-2xl p-6 sticky top-24">
                            <h3 className="font-display font-bold text-xl text-white mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6 pb-6 border-b border-white/5">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-green-400">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Tax (18% GST)</span>
                                    <span className="text-white">₹{Math.round(cartTotal * 0.18)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-lg font-bold text-white mb-8">
                                <span>Total</span>
                                <span>₹{Math.round(cartTotal * 1.18)}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-tronix-primary text-white font-bold py-4 rounded-xl hover:bg-violet-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 group"
                            >
                                Proceed to Checkout
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                Secure Checkout - 256-bit Encryption
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

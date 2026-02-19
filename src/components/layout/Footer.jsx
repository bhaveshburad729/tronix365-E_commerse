import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ShieldCheck, Truck, CreditCard } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-tronix-dark border-t border-white/5 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand & About */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-tronix-primary rounded flex items-center justify-center">
                                <span className="text-white font-display font-bold text-lg">T</span>
                            </div>
                            <span className="font-display font-bold text-xl tracking-wider text-white">
                                TRONIX<span className="text-tronix-primary">365</span>
                            </span>
                        </div>
                        <p className="text-tronix-muted text-sm leading-relaxed">
                            Your one-stop destination for high-quality electronics, components, and development boards. Empowering makers and engineers since 2024.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="text-gray-400 hover:text-tronix-primary transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-tronix-primary transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-tronix-primary transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-tronix-primary transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-display font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><a href="/#about" className="text-tronix-muted hover:text-tronix-primary text-sm transition-colors">About Us</a></li>
                            <li><a href="/#contact" className="text-tronix-muted hover:text-tronix-primary text-sm transition-colors">Contact</a></li>
                            <li><Link to="/terms" className="text-tronix-muted hover:text-tronix-primary text-sm transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="text-tronix-muted hover:text-tronix-primary text-sm transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-display font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-tronix-muted text-sm">
                                <MapPin size={18} className="text-tronix-primary shrink-0 mt-0.5" />
                                <span>123 Tech Park, Innovation Street,<br />Silicon Valley, India</span>
                            </li>
                            <li className="flex items-center gap-3 text-tronix-muted text-sm">
                                <Phone size={18} className="text-tronix-primary shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-tronix-muted text-sm">
                                <Mail size={18} className="text-tronix-primary shrink-0" />
                                <span>support@tronix365.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-display font-bold mb-6">Stay Updated</h3>
                        <p className="text-tronix-muted text-xs mb-4">Subscribe for latest products and offers.</p>
                        <form className="space-y-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-tronix-primary transition-colors"
                            />
                            <button className="w-full bg-tronix-primary hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="border-t border-white/5 pt-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center justify-center gap-3 text-tronix-muted">
                            <ShieldCheck className="text-tronix-accent" size={24} />
                            <div className="text-left">
                                <p className="text-white text-sm font-semibold">Secure Payment</p>
                                <p className="text-xs">100% Protected</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-tronix-muted">
                            <Truck className="text-tronix-accent" size={24} />
                            <div className="text-left">
                                <p className="text-white text-sm font-semibold">Fast Shipping</p>
                                <p className="text-xs">Pan India Delivery</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-tronix-muted">
                            <CreditCard className="text-tronix-accent" size={24} />
                            <div className="text-left">
                                <p className="text-white text-sm font-semibold">Easy Returns</p>
                                <p className="text-xs">7 Days Policy</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center">
                    <p className="text-tronix-muted text-xs">
                        © 2024 Tronix365. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

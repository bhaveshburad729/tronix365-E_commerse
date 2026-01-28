import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            console.log("Sending signup request to http://localhost:8000/signup", formData);
            const response = await fetch('http://localhost:8000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Auto login (store token)
                localStorage.setItem('tronix_token', data.access_token);
                localStorage.setItem('tronix_user', JSON.stringify({
                    name: data.user_name,
                    role: data.role,
                    email: formData.email
                }));

                // Redirect
                navigate('/');
                window.location.reload(); // To update Navbar state
            } else {
                console.error("Signup failed:", data);
                setError(data.detail || 'Registration failed');
                alert(`Signup failed: ${data.detail || 'Registration failed'}`);
            }
        } catch (err) {
            console.error("Signup Error:", err);
            setError('Server unavailable. Please try again later.');
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-tronix-primary/20 rounded-full blur-[100px] -z-10" />

            <div
                className="max-w-md w-full space-y-8 glass-card p-8 rounded-2xl border border-white/10 relative z-10"
            >
                <div>
                    <h2 className="text-3xl font-display font-bold text-white text-center mb-2">Create Account</h2>
                    <p className="text-gray-400 text-center">Join the future of electronics</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-tronix-primary transition-colors">
                                <User size={20} />
                            </div>
                            <input
                                name="full_name"
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tronix-primary/50 focus:border-transparent transition-all"
                                placeholder="Full Name"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-tronix-primary transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tronix-primary/50 focus:border-transparent transition-all"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-tronix-primary transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tronix-primary/50 focus:border-transparent transition-all"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-tronix-primary transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tronix-primary/50 focus:border-transparent transition-all"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-tronix-primary hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tronix-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
                    >
                        {loading ? <Loader className="animate-spin" /> : "Create Account"}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="font-medium text-tronix-primary hover:text-white transition-colors text-sm">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;

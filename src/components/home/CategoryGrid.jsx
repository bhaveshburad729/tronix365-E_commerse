import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Battery, Zap, CircuitBoard, Wifi, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
    { name: 'Development Boards', icon: CircuitBoard, count: '120+ Products', color: 'from-violet-500 to-fuchsia-500' },
    { name: 'Sensors', icon: Wifi, count: '85+ Products', color: 'from-cyan-500 to-blue-500' },
    { name: 'Modules', icon: Cpu, count: '200+ Products', color: 'from-purple-500 to-pink-500' },
    { name: 'Motors', icon: Zap, count: '45+ Products', color: 'from-amber-500 to-orange-500' },
    { name: 'Battery', icon: Battery, count: '30+ Products', color: 'from-emerald-500 to-teal-500' },
    { name: 'Displays', icon: Monitor, count: '50+ Products', color: 'from-indigo-500 to-violet-500' },
];

const CategoryGrid = () => {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-tronix-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-tronix-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        Shop By <span className="text-transparent bg-clip-text bg-gradient-to-r from-tronix-primary to-tronix-accent">Category</span>
                    </h2>
                    <p className="text-tronix-muted max-w-2xl mx-auto">
                        Explore our wide range of electronic components, carefully categorized for your convenience.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat, index) => (
                        <Link to={`/category/${cat.name.toLowerCase().replace(' ', '-')}`} key={index}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center h-full group"
                            >
                                <div className={`p-4 rounded-full bg-gradient-to-br ${cat.color} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <cat.icon className="text-white w-8 h-8" />
                                </div>
                                <h3 className="text-white font-medium mb-1 group-hover:text-tronix-primary transition-colors">{cat.name}</h3>
                                <p className="text-xs text-tronix-muted">{cat.count}</p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;

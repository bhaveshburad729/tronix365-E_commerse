import React from 'react';
import HeroSlider from '../components/home/HeroSlider';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductCard from '../components/product/ProductCard';
import { products } from '../data/mockData';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    // Select featured products (e.g., first 4)
    const featuredProducts = products.slice(0, 4);

    return (
        <main className="min-h-screen pt-16">
            <HeroSlider />

            <CategoryGrid />

            {/* Featured Products Section */}
            <section className="py-20 bg-tronix-dark border-t border-white/5 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <div className="flex items-center gap-2 text-tronix-primary mb-2">
                                <Zap size={20} />
                                <span className="font-bold text-sm tracking-wider uppercase">Trending Now</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-tronix-primary to-tronix-accent">Products</span></h2>
                        </div>
                        <Link to="/shop" className="hidden md:flex items-center gap-2 text-white hover:text-tronix-primary transition-colors font-medium">
                            View All Products <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.map(product => (
                            <div key={product.id} className="h-full">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center md:hidden">
                        <Link to="/shop" className="inline-flex items-center gap-2 text-white bg-tronix-card border border-white/10 px-6 py-3 rounded-full hover:bg-tronix-primary transition-colors font-medium">
                            View All Products <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Banner / Call to Action */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
                        alt="Electronics Banner"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tronix-bg via-tronix-bg/80 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                        Build Your <span className="text-tronix-primary">Dreams</span>
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
                        From Arduino to Raspberry Pi, we have everything you need to bring your ideas to life. Start building today.
                    </p>
                    <Link to="/shop" className="inline-block bg-tronix-primary hover:bg-violet-600 text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg shadow-violet-500/30 transition-all hover:scale-105">
                        Start Shopping
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default Home;

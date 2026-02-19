import React from 'react';
import HeroSlider from '../components/home/HeroSlider';
import FeaturedProducts from '../components/home/FeaturedProducts';
import { AboutSection, ContactSection } from '../components/home/InfoSections';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <main className="min-h-screen pt-16">
            <HeroSlider />

            {/* Featured Products Section - now a component */}
            <FeaturedProducts />

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

            {/* Info Sections */}
            <AboutSection />
            <ContactSection />
        </main>
    );
};

export default Home;

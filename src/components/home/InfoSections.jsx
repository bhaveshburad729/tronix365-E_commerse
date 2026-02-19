import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, ExternalLink, Code, Cpu, Globe } from 'lucide-react';

export const AboutSection = () => {
    return (
        <section id="about" className="py-20 bg-gradient-to-b from-tronix-bg to-[#0a0a0f] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-20 left-10 w-64 h-64 bg-tronix-primary rounded-full filter blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-tronix-accent rounded-full filter blur-[100px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Empowering Innovation</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        We provide the building blocks for the future. From hobbyists to professional engineers, TRONIX365 is your partner in creation.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Cpu size={32} />,
                            title: "Premium Components",
                            desc: "Sourced directly from trusted manufacturers to ensure reliability for your critical projects."
                        },
                        {
                            icon: <Code size={32} />,
                            title: "Open Source Spirit",
                            desc: "We believe in sharing knowledge. Our community is built on collaboration and open-source principles."
                        },
                        {
                            icon: <Globe size={32} />,
                            title: "Global Shipping",
                            desc: "Fast, tracked shipping worldwide so you can start building no matter where you are."
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-tronix-card/30 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:bg-tronix-card/50 hover:border-tronix-primary/30 transition-all group"
                        >
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-tronix-primary mb-6 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

import { useState } from 'react';
import toast from 'react-hot-toast';

export const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: Reuse the same /contact endpoint. It expects name, email, message.
            // We can append subject to message or update backend. 
            // For now, let's prepend subject to message to avoid backend changes if backend schema is strict
            // Backend schema: name, email, message.
            const payload = {
                name: formData.name,
                email: formData.email,
                message: `Subject: ${formData.subject}\n\n${formData.message}`
            };

            const response = await fetch('http://localhost:8000/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success('Message sent successfully!');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                toast.error('Failed to send message.');
            }
        } catch (error) {
            console.error('Contact error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Let's Build Together</h2>
                        <p className="text-xl text-gray-400 mb-8">
                            Have a question about a component? Need a bulk quote? Or just want to show off your latest project? We'd love to hear from you.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: <MapPin />, text: "123 Innovation Park, Silicon Valley, India" },
                                { icon: <Mail />, text: "support@tronix365.com" },
                                { icon: <Phone />, text: "+91 98765 43210" }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-4 text-gray-300">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-tronix-primary shrink-0">
                                        {item.icon}
                                    </div>
                                    <span className="text-lg">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-tronix-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary outline-none transition-all"
                                        placeholder="tronix"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary outline-none transition-all"
                                        placeholder="abc@example"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary outline-none transition-all"
                                    placeholder="Project Inquiry"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Message</label>
                                <textarea
                                    rows={4}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-tronix-primary focus:ring-1 focus:ring-tronix-primary outline-none transition-all"
                                    placeholder="Tell us about your project..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-tronix-primary hover:bg-violet-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';

const Location = () => {
    return (
        <div className="font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 bg-slate-50 min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            Find <span className="text-blue-400">MuscleHub</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            Headquarters of elite fitness. Visit us to kickstart your transformation today.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info & Map Section */}
            <section className="py-20 -mt-10 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-start gap-4"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Our Location</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        123 Fitness Avenue, <br />
                                        Colombo 03,<br />
                                        Sri Lanka
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-start gap-4"
                            >
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Clock className="text-emerald-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Opening Hours</h3>
                                    <ul className="text-slate-600 space-y-1">
                                        <li className="flex justify-between"><span>Mon - Fri:</span> <span className="font-semibold">5:00 AM - 11:00 PM</span></li>
                                        <li className="flex justify-between"><span>Saturday:</span> <span className="font-semibold">6:00 AM - 10:00 PM</span></li>
                                        <li className="flex justify-between"><span>Sunday:</span> <span className="font-semibold">6:00 AM - 8:00 PM</span></li>
                                    </ul>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Contact Us</h3>
                                        <p className="text-slate-600 font-medium">011-2224455</p>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-slate-100"></div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="text-rose-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Email</h3>
                                        <p className="text-slate-600 font-medium">info@musclehub.com</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Map Area */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative min-h-[500px]"
                        >
                            {/* Embedded Google Map */}
                            <iframe
                                src="https://maps.google.com/maps?q=6.9184448641095395,79.96866196346662&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                className="absolute inset-0 w-full h-full border-0"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="MuscleHub Location"
                            ></iframe>

                            {/* Overlay CTA */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm w-full mx-4 border border-blue-100">
                                <div className="p-3 bg-blue-600 rounded-lg shrink-0">
                                    <Navigation className="text-white" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Need Directions?</h4>
                                    <a href="https://maps.google.com/?q=6.9184448641095395,79.96866196346662" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                                        Open in Google Maps &rarr;
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Location;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Star, Crown, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const planStyles = [
    {
        headerBg: 'bg-gradient-to-br from-slate-800 to-slate-900',
        badge: null,
        btnClass: 'border-2 border-slate-800 text-slate-800 hover:bg-slate-900 hover:text-white',
        icon: Zap,
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-700',
        accent: 'text-emerald-500',
        featured: false,
    },
    {
        headerBg: 'bg-gradient-to-br from-blue-600 to-indigo-700',
        badge: 'Most Popular',
        btnClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02]',
        icon: Star,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        accent: 'text-blue-500',
        featured: true,
    },
    {
        headerBg: 'bg-gradient-to-br from-purple-700 to-indigo-900',
        badge: 'Premium',
        btnClass: 'border-2 border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white',
        icon: Crown,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        accent: 'text-purple-500',
        featured: false,
    },
];

const Offers = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/api/membership/packages')
            .then(res => setPackages(res.data))
            .catch(err => console.error('Failed to fetch packages', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-4 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6">
                            Exclusive Membership Plans
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white">
                            Choose Your <span className="text-blue-400">Plan</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                            Unlock elite fitness access. Our plans are designed to match every goal and budget.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Packages Section */}
            <section className="py-24 bg-white -mt-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={48} />
                            <p className="text-slate-500 font-medium">Loading membership packages...</p>
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-slate-400 text-lg font-medium">No membership packages available at the moment.</p>
                            <p className="text-slate-400 text-sm mt-2">Please check back later or contact us for pricing.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                            {packages.map((pkg, idx) => {
                                const style = planStyles[idx % planStyles.length];
                                const IconComp = style.icon;
                                return (
                                    <motion.div
                                        key={pkg.id}
                                        initial={{ y: 30, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 ${style.featured ? 'md:-mt-6 border-t-4 border-t-blue-500 relative z-10' : ''}`}
                                    >
                                        {/* Badge */}
                                        {style.badge && (
                                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-sm">
                                                {style.badge}
                                            </div>
                                        )}

                                        {/* Header */}
                                        <div className={`${style.headerBg} p-8 text-white text-center relative`}>
                                            <div className={`inline-flex items-center justify-center w-14 h-14 ${style.iconBg} rounded-2xl mb-4`}>
                                                <IconComp className={style.iconColor} size={28} />
                                            </div>
                                            <h3 className="text-xl font-bold uppercase tracking-wider mb-1">{pkg.name}</h3>
                                            <div className="text-5xl font-extrabold mt-3 mb-1">
                                                Rs.{Number(pkg.price).toLocaleString()}
                                                <span className="text-lg font-normal opacity-70"> /{pkg.durationMonths}mo</span>
                                            </div>
                                            {style.featured && (
                                                <p className="text-blue-100 text-xs opacity-80 mt-1">Best Value</p>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div className="p-8">
                                            {pkg.description && (
                                                <ul className="space-y-3 mb-8">
                                                    {pkg.description.split(/[,.\n]/).filter(f => f.trim()).map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                                            <CheckCircle className={`${style.accent} flex-shrink-0 mt-0.5`} size={18} />
                                                            <span>{feature.trim()}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <button
                                                onClick={() => navigate('/login')}
                                                className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all duration-300 uppercase text-sm tracking-wide ${style.btnClass}`}
                                            >
                                                Get Started
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-extrabold mb-4">Not Sure Which Plan Is Right for You?</h2>
                    <p className="text-blue-100 mb-8">Talk to one of our expert trainers for a personalized recommendation.</p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="bg-white text-blue-700 font-bold py-3 px-10 rounded-full hover:shadow-xl hover:scale-105 transition-all"
                    >
                        Contact Us
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Offers;



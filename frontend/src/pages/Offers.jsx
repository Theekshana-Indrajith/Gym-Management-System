import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { CheckCircle, X, Sparkles, Clock, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';

const Offers = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/membership/public/packages');
                setPackages(res.data);
            } catch (err) {
                console.error("Failed to fetch packages:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    return (
        <div className="font-sans text-slate-800 bg-slate-50">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-32 bg-slate-900 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2000')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            <Sparkles size={14} /> Elite Access Protocols
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter uppercase italic">
                            Membership <span className="text-blue-500">Offers</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed italic">
                            Choose your deployment level. All plans include AI-driven biological mapping and elite training sequences.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 -mt-20 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
                            {packages.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-white rounded-[4rem] border border-slate-200 shadow-xl">
                                    <ShieldCheck className="mx-auto mb-4 text-slate-300" size={48} />
                                    <p className="text-xl font-black text-slate-900 uppercase italic">No Active Protocols Found</p>
                                    <p className="text-slate-400 font-medium italic">Systems are currently being recalibrated. Please check back later.</p>
                                </div>
                            ) : packages.map((pkg, idx) => (
                                <motion.div
                                    key={pkg.id}
                                    initial={{ y: 30, opacity: 0 }}
                                    whileInView={{ y: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-[4rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col relative group overflow-hidden"
                                >
                                    {/* Accent background */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
                                    
                                    <div className="mb-8 relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-lg">
                                                <Zap size={24} />
                                            </div>
                                            {idx === 1 && (
                                                <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">Recommended</span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">{pkg.name}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-blue-600">LKR {pkg.price}</span>
                                            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">/ {pkg.durationMonths} Months</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1 relative z-10">
                                        {['AI Integrated Training', 'Elite Coaching Access', 'Nutritional Gene-Mapping', '24/7 Priority Support'].map((feat, i) => (
                                            <div key={i} className="flex items-center gap-3 text-slate-600">
                                                <CheckCircle size={18} className="text-blue-500 shrink-0" />
                                                <span className="text-sm font-bold uppercase tracking-tight text-[11px]">{feat}</span>
                                            </div>
                                        ))}
                                        <div className="pt-6 border-t border-slate-50 mt-6">
                                            <p className="text-[12px] text-slate-400 italic leading-relaxed font-medium">
                                                {pkg.description || "Deploy our full suite of professional fitness management features on your athlete profile."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 relative z-10">
                                        <button 
                                            onClick={() => window.location.href = '/signup'}
                                            className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-blue-600 transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl group-hover:scale-[1.02] active:scale-95"
                                        >
                                            Initiate Protocol
                                        </button>
                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            <Clock size={14} className="text-slate-300" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Limited Time Enrollment</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="mt-20 text-center">
                        <div className="bg-slate-900/5 rounded-[3rem] p-12 border border-slate-200/50 backdrop-blur-sm">
                            <h4 className="text-2xl font-black text-slate-900 mb-4 uppercase italic">Need a Custom Enterprise Plan?</h4>
                            <p className="text-slate-500 font-medium mb-8 max-w-2xl mx-auto italic">For teams, athletic organizations or corporate wellness programs, we offer specialized bulk deployment protocols.</p>
                            <button 
                                onClick={() => window.location.href = '/contact'}
                                className="bg-white border-2 border-slate-900 text-slate-900 px-10 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
                            >
                                Contact Operations
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Offers;


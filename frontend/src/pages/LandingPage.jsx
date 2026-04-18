import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Users, Trophy, Target, Clock, Sparkles, TrendingUp, Award, Heart, Shield, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070",
            tag: "Peak Performance",
            title: "Redefine Your Limits",
            subtitle: "Experience AI-driven training tailored to your unique bio-profile."
        },
        {
            image: "https://th.bing.com/th/id/R.52e6fbfc551fdb5db707cf50acf29aaf?rik=xsiq%2fIySZ3THPQ&pid=ImgRaw&r=0",
            tag: "Smart Recovery",
            title: "Train Harder, Recover Smarter",
            subtitle: "Intelligent recovery protocols derived from real-time performance data."
        },
        {
            image: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80&w=2070",
            tag: "Elite Community",
            title: "Join The 1% Elite",
            subtitle: "Connect with dedicated athletes and world-class certified masters."
        },
        {
            image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2070",
            tag: "Next-Gen Facility",
            title: "State-Of-The-Art Logic",
            subtitle: "Train with the most advanced biometric equipment ever engineered."
        },
        {
            image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070",
            tag: "Neural Progress",
            title: "Quantify Your Evolution",
            subtitle: "Turn every bead of sweat into a data point for your future self."
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="font-sans text-slate-800 selection:bg-blue-600 selection:text-white bg-slate-50">
            <Navbar transparentTextWhite={true} />

            {/* Dynamic Hero Section */}
            <section id="home" className="relative h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
                <AnimatePresence>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="absolute inset-0 z-0"
                    >
                        <img
                            src={slides[currentSlide].image}
                            alt="Hero Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900"></div>
                    </motion.div>
                </AnimatePresence>

                {/* Abstract Geometric Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] border border-blue-500/10 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] border border-purple-500/10 rounded-full"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        key={`content-${currentSlide}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-xl">
                            <Sparkles size={12} /> {slides[currentSlide].tag}
                        </span>

                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.9] drop-shadow-2xl">
                            {slides[currentSlide].title.split(' ').map((word, i) => (
                                <span key={i} className={word === 'AI' || word === 'Precision' ? 'text-blue-600' : ''}>
                                    {word}{' '}
                                </span>
                            ))}
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                            {slides[currentSlide].subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
                            <Link to="/login" className="group relative px-10 py-5 bg-blue-600 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/40 active:scale-95 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative z-10 text-white font-black uppercase tracking-widest text-xs flex items-center gap-3">
                                    INITIALIZE JOURNEY <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>

                            <Link to="/about" className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl text-white font-black uppercase tracking-widest text-xs border border-white/10 transition-all active:scale-95">
                                EXPLORE ARCHITECTURE
                            </Link>
                        </div>
                    </motion.div>

                    {/* Slider Indicators */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`h-1 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-10 bg-blue-500' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Real-time Stats Section */}
            <section className="relative py-24 bg-slate-900 border-y border-slate-800">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-5"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { val: "12K+", label: "ACTIVE NODES", sub: "Global Members" },
                            { val: "250+", label: "CORE TRAINERS", sub: "Certified Masters" },
                            { val: "99.2%", label: "ACCURACY RATE", sub: "AI Evolution" },
                            { val: "24/7", label: "UPTIME", sub: "Facility Access" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-left border-l-2 border-blue-600/30 pl-6"
                            >
                                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{stat.val}</div>
                                <div className="text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] mb-1">{stat.label}</div>
                                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.sub}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enhanced Features Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[120px] -mr-48 -mt-48 opacity-60"></div>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="max-w-2xl"
                        >
                            <span className="text-blue-600 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">System Capabilities</span>
                            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">PRECISE FITNESS <br /><span className="text-slate-300">ENGINEERING.</span></h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="w-24 h-0.5 bg-slate-200 mb-4 hidden md:block"
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Neural Plans", desc: "Proprietary AI algorithms that learn your body's specific response to stimulus.", color: "blue" },
                            { icon: Users, title: "Alpha Mentors", desc: "Expert trainers vetted through rigorous physical and cognitive standards.", color: "indigo" },
                            { icon: Activity, title: "Bio Metrics", desc: "Real-time tracking of every rep, set, and calorie for absolute transparency.", color: "emerald" },
                            { icon: Target, title: "Goal Architecture", desc: "Deconstruct your vision into a structural roadmap with actionable milestones.", color: "orange" },
                            { icon: Shield, title: "Safety Matrix", desc: "Smart equipment monitoring ensuring perfect form and zero-injury protocols.", color: "rose" },
                            { icon: Sparkles, title: "Modern Rituals", desc: "State-of-the-art facilities designed for maximum psychological focus.", color: "amber" }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative bg-slate-50 rounded-[2.5rem] p-10 hover:bg-slate-900 transition-all duration-700 overflow-hidden border border-slate-100 hover:border-slate-800"
                            >
                                <div className={`w-16 h-16 bg-${feature.color}-600 rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl shadow-${feature.color}-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-slate-900 group-hover:text-white transition-colors tracking-tight">{feature.title}</h3>
                                <p className="text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Matrix - Testimonials */}
            <section className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-blue-600 font-black tracking-[0.3em] uppercase text-[10px]"
                        >
                            The Verification
                        </motion.span>
                        <h2 className="text-5xl md:text-7xl font-black mt-4 text-slate-900 tracking-tighter">TRANSFORMATION <br /><span className="text-slate-300">LOGS.</span></h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { name: "SARAH ANDERSON", role: "Athlete", msg: "The AI-powered workout plans completely transformed my fitness journey. I've never felt stronger.", initial: "SA" },
                            { name: "MICHAEL CHEN", role: "Developer", msg: "Best gym I've ever joined! The trainers are amazing and the facilities are top-notch.", initial: "MC" },
                            { name: "EMILY PARKER", role: "Designer", msg: "Lost 30 pounds in 4 months! The personalized diet and workout plans made all the difference.", initial: "EP" }
                        ].map((test, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 relative group"
                            >
                                <div className="flex items-center gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <div key={s} className="w-4 h-1 bg-blue-600 rounded-full"></div>
                                    ))}
                                </div>
                                <p className="text-slate-600 text-lg font-medium mb-10 leading-relaxed italic">"{test.msg}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm group-hover:bg-blue-600 transition-colors">
                                        {test.initial}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-xs tracking-widest">{test.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{test.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* High-Impact CTA Section */}
            <section className="py-40 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541534741688-6078c65b5a33?q=80&w=2070')] bg-cover bg-fixed opacity-10 grayscale"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-3 bg-blue-600/20 border border-blue-600/30 rounded-full px-5 py-2 mb-10 backdrop-blur-md">
                            <Activity className="text-blue-400" size={20} />
                            <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">Protocol Activation</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black text-white mb-10 leading-[0.9] tracking-tighter">
                            EVOLVE YOUR <br />LEGACY <span className="text-blue-600">NOW.</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium">
                            Join the next evolutionary step in human performance. Deploy MuscleHub's AI architecture to your daily routine.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
                            <Link to="/signup" className="px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-3xl shadow-blue-500/50 active:scale-95">
                                START FREE DEPLOYMENT
                            </Link>
                            <Link to="/offers" className="px-12 py-6 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl border border-white/20 transition-all active:scale-95">
                                VIEW TIER PRICING
                            </Link>
                        </div>
                        <p className="text-slate-600 text-[10px] font-black tracking-[0.2em] uppercase mt-10">Limited slots available / Full facility access inclusive</p>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;

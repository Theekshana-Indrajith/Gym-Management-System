import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Brain, Activity, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkoutDiet = () => {
    const navigate = useNavigate();

    return (
        <div className="font-sans text-slate-800">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-blue-50 to-purple-50 min-h-[40vh] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-600 text-sm font-semibold mb-6">
                            AI-Powered Fitness
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900">
                            Smart Workout & Diet Prediction
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Experience personalized workout and diet plans powered by advanced artificial intelligence.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="flex gap-5 items-start"
                            >
                                <div className="bg-blue-100 p-4 rounded-2xl h-fit shadow-sm">
                                    <Brain className="text-blue-600" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">Intelligent Analysis</h3>
                                    <p className="text-slate-600 leading-relaxed">Our AI analyzes your body type, goals, and progress to generate the perfect workout routine tailored just for you.</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex gap-5 items-start"
                            >
                                <div className="bg-green-100 p-4 rounded-2xl h-fit shadow-sm">
                                    <Activity className="text-green-600" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">Dynamic Meal Plans</h3>
                                    <p className="text-slate-600 leading-relaxed">Get meal suggestions that adapt to your daily calorie burn and nutritional needs, ensuring optimal results.</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="flex gap-5 items-start"
                            >
                                <div className="bg-purple-100 p-4 rounded-2xl h-fit shadow-sm">
                                    <Sparkles className="text-purple-600" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">Predictive Progression</h3>
                                    <p className="text-slate-600 leading-relaxed">Stay ahead with AI that predicts your future performance and adjusts intensity to prevent plateaus.</p>
                                </div>
                            </motion.div>
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-500 italic flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Log in required to access personalized plans.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Get Started Now
                                </button>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-slate-50 rounded-3xl p-8 shadow-inner border border-slate-100 transform hover:rotate-1 transition-transform duration-500"
                        >
                            {/* Neural Performance Matrix Preview */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden group">
                                <div className="bg-slate-800/80 backdrop-blur-xl rounded-[2.3rem] p-8 border border-white/5 relative overflow-hidden">
                                    {/* Abstract background elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                                                    <Brain size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black text-xl tracking-tight">Neural Engine</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Optimization</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-white">99.4%</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Gen-Match</div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Metrics Grid */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Hypertrophy Index</p>
                                                    <p className="text-white font-bold text-lg">0.84 <span className="text-emerald-400 text-xs ml-1">↑12%</span></p>
                                                </div>
                                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Metabolic Rate</p>
                                                    <p className="text-white font-bold text-lg">Optimal</p>
                                                </div>
                                            </div>

                                            {/* Progress Visualization */}
                                            <div className="space-y-4 pt-2">
                                                <div>
                                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                                                        <span className="text-slate-400">Protein Synthesis</span>
                                                        <span className="text-blue-400">Critical Stage</span>
                                                    </div>
                                                    <div className="w-full bg-slate-900 rounded-full h-2 px-0.5 flex items-center">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: '85%' }}
                                                            transition={{ duration: 1.5, delay: 0.5 }}
                                                            className="bg-gradient-to-r from-blue-600 to-indigo-400 h-1 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                                        ></motion.div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                                                        <span className="text-slate-400">Cortisol Levels</span>
                                                        <span className="text-emerald-400">Stabilized</span>
                                                    </div>
                                                    <div className="w-full bg-slate-900 rounded-full h-2 px-0.5 flex items-center">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: '32%' }}
                                                            transition={{ duration: 1.5, delay: 0.7 }}
                                                            className="bg-gradient-to-r from-emerald-600 to-teal-400 h-1 rounded-full shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                                                        ></motion.div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Command Pulse */}
                                            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 relative group/msg">
                                                <div className="flex gap-4 items-start">
                                                    <Sparkles className="text-blue-400 shrink-0 mt-1" size={18} />
                                                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                                        "System detected high central nervous system fatigue. Shifting next session to <span className="text-blue-400 font-bold">Active Recovery Protocol</span>."
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Non-interactive Status Badge */}
                                            <div className="flex items-center justify-center gap-2 py-4 border-t border-white/5 mt-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6] animate-pulse"></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Neural Sync in Progress...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default WorkoutDiet;

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
                            {/* AI Dashboard Preview */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                        <h4 className="font-bold text-lg">Daily Insight</h4>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">98% Accuracy</span>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500 font-medium">Calorie Target</span>
                                            <span className="font-bold text-slate-900">2,450 / 2,800 kcal</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full w-[88%] shadow-sm"></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500 font-medium">Recovery Status</span>
                                            <span className="font-bold text-slate-900">Optimal</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-3 rounded-full w-[65%] shadow-sm"></div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                                        <div className="min-w-fit mt-0.5">✨</div>
                                        <p className="text-sm text-blue-800 font-medium">Based on your recent lifts, increase protein intake by 15g today for optimal muscle recovery.</p>
                                    </div>

                                    <button className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl">
                                        Generate New Plan
                                    </button>
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

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Trophy, Target, Clock, Sparkles, TrendingUp, Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
            <Navbar />

            {/* Hero Section */}
            <section id="home" className="relative h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6 backdrop-blur-sm">
                            The Future of Fitness Management
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
                    >
                        Transform Your Body with <span className="text-blue-500">AI Precision</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto"
                    >
                        Experience the next generation of gym management. Personalized workouts and diet plans powered by advanced artificial intelligence.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <Link to="/login" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                            Get Started
                            <ArrowRight className="ml-2" />
                        </Link>
                        <Link to="/about" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full transition-all border border-white/10">
                            Learn More
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-noise.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0 }}
                            className="text-center"
                        >
                            <div className="text-5xl md:text-6xl font-extrabold text-white mb-2">5K+</div>
                            <div className="text-blue-100 uppercase tracking-wider text-sm font-semibold">Active Members</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center"
                        >
                            <div className="text-5xl md:text-6xl font-extrabold text-white mb-2">100+</div>
                            <div className="text-blue-100 uppercase tracking-wider text-sm font-semibold">Expert Trainers</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="text-5xl md:text-6xl font-extrabold text-white mb-2">98%</div>
                            <div className="text-blue-100 uppercase tracking-wider text-sm font-semibold">Success Rate</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-center"
                        >
                            <div className="text-5xl md:text-6xl font-extrabold text-white mb-2">24/7</div>
                            <div className="text-blue-100 uppercase tracking-wider text-sm font-semibold">Access</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Why Choose Us</span>
                            <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4 text-slate-900">Premium Features</h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0 }}
                            className="group"
                        >
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Zap className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">AI-Powered Plans</h3>
                                <p className="text-slate-600 leading-relaxed">Get personalized workout and diet plans that adapt to your progress using advanced AI algorithms.</p>
                            </div>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="group"
                        >
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Users className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">Expert Trainers</h3>
                                <p className="text-slate-600 leading-relaxed">Train with certified professionals who are passionate about helping you reach your fitness goals.</p>
                            </div>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="group"
                        >
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Trophy className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">Track Progress</h3>
                                <p className="text-slate-600 leading-relaxed">Monitor your fitness journey with detailed analytics and celebrate every milestone you achieve.</p>
                            </div>
                        </motion.div>

                        {/* Feature 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="group"
                        >
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-orange-100 hover:border-orange-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Target className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">Goal Setting</h3>
                                <p className="text-slate-600 leading-relaxed">Set clear, achievable goals and let our AI help you create the perfect roadmap to success.</p>
                            </div>
                        </motion.div>

                        {/* Feature 5 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="group"
                        >
                            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-teal-100 hover:border-teal-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">Flexible Hours</h3>
                                <p className="text-slate-600 leading-relaxed">Access our facilities 24/7 to fit your workout around your busy schedule.</p>
                            </div>
                        </motion.div>

                        {/* Feature 6 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="group"
                        >
                            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-yellow-100 hover:border-yellow-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Sparkles className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">Modern Equipment</h3>
                                <p className="text-slate-600 leading-relaxed">Train with the latest state-of-the-art fitness equipment and facilities.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Success Stories</span>
                            <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4 text-slate-900">What Our Members Say</h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0 }}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Award key={star} className="text-yellow-500 fill-yellow-500" size={20} />
                                ))}
                            </div>
                            <p className="text-slate-600 mb-6 leading-relaxed italic">"The AI-powered workout plans completely transformed my fitness journey. I've never felt stronger and more confident!"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    SA
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Sarah Anderson</h4>
                                    <p className="text-sm text-slate-500">Member since 2024</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Testimonial 2 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Award key={star} className="text-yellow-500 fill-yellow-500" size={20} />
                                ))}
                            </div>
                            <p className="text-slate-600 mb-6 leading-relaxed italic">"Best gym I've ever joined! The trainers are amazing and the facilities are top-notch. Highly recommended!"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    MC
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Michael Chen</h4>
                                    <p className="text-sm text-slate-500">Member since 2023</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Testimonial 3 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Award key={star} className="text-yellow-500 fill-yellow-500" size={20} />
                                ))}
                            </div>
                            <p className="text-slate-600 mb-6 leading-relaxed italic">"Lost 30 pounds in 4 months! The personalized diet and workout plans made all the difference. Thank you MuscleHub!"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    EP
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Emily Parker</h4>
                                    <p className="text-sm text-slate-500">Member since 2024</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                            <Heart className="text-blue-300" size={20} />
                            <span className="text-blue-300 font-semibold text-sm">Start Your Journey Today</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                            Ready to Transform Your Life?
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            Join thousands of members who have already achieved their fitness goals with MuscleHub's AI-powered platform.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/signup" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50">
                                Start Free Trial
                                <TrendingUp className="ml-2" size={20} />
                            </Link>
                            <Link to="/offers" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-full transition-all border border-white/20">
                                View Pricing
                            </Link>
                        </div>
                        <p className="text-slate-400 text-sm mt-6">No credit card required • 7-day free trial • Cancel anytime</p>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;

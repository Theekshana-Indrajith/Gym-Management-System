import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="font-sans text-slate-800">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-slate-50 to-blue-50 min-h-[40vh] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-600 text-sm font-semibold mb-6">
                            About MuscleHub
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900">
                            We Are Redefining Fitness
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Combining state-of-the-art facilities with cutting-edge AI technology.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop"
                                alt="Gym Interior"
                                className="rounded-2xl shadow-2xl border-4 border-slate-100 hover:scale-[1.02] transition-transform duration-500"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-slate-900">Our Story</h2>
                            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                                Founded in 2024, MuscleHub combines state-of-the-art facilities with cutting-edge AI technology to help you achieve your fitness goals faster and safer. We believe in data-driven results.
                            </p>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                Our mission is to revolutionize the fitness industry by making personalized training accessible to everyone. With our team of expert trainers and AI-powered insights, we're committed to helping you reach your full potential.
                            </p>
                            <div className="grid grid-cols-2 gap-8 mt-8 border-t border-slate-200 pt-8">
                                <div>
                                    <h4 className="text-4xl font-extrabold text-blue-600 mb-1">5k+</h4>
                                    <p className="text-slate-500 text-sm uppercase tracking-wide">Happy Members</p>
                                </div>
                                <div>
                                    <h4 className="text-4xl font-extrabold text-blue-600 mb-1">100+</h4>
                                    <p className="text-slate-500 text-sm uppercase tracking-wide">Expert Trainers</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Values Section */}
                    <div className="mt-24">
                        <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">Our Values</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0 }}
                                className="bg-slate-50 p-8 rounded-2xl hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-600 rounded-xl mb-4 flex items-center justify-center text-white text-2xl font-bold">1</div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Innovation</h3>
                                <p className="text-slate-600">We leverage the latest AI technology to provide personalized fitness experiences.</p>
                            </motion.div>
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-slate-50 p-8 rounded-2xl hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-600 rounded-xl mb-4 flex items-center justify-center text-white text-2xl font-bold">2</div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Community</h3>
                                <p className="text-slate-600">We foster a supportive environment where everyone feels welcome and motivated.</p>
                            </motion.div>
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-50 p-8 rounded-2xl hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-600 rounded-xl mb-4 flex items-center justify-center text-white text-2xl font-bold">3</div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Results</h3>
                                <p className="text-slate-600">We're committed to delivering measurable results through data-driven approaches.</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;

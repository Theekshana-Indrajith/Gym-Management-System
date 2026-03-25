import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

const Offers = () => {
    return (
        <div className="font-sans text-slate-800">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-[40vh] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 text-sm font-semibold mb-6">
                            Exclusive Deals
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900">
                            Membership Offers
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Choose the perfect plan that fits your fitness journey and goals.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {/* Card 1 */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0 }}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
                        >
                            <div className="bg-slate-900 p-8 text-white text-center">
                                <h3 className="text-xl font-bold uppercase tracking-wider">Standard</h3>
                                <div className="text-5xl font-extrabold mt-4 mb-2">$29<span className="text-xl font-normal text-slate-400">/mo</span></div>
                            </div>
                            <div className="p-8">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-slate-700 font-medium"><CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} /> Access to Gym Floor</li>
                                    <li className="flex items-center text-slate-700 font-medium"><CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} /> Standard Locker</li>
                                    <li className="flex items-center text-slate-400"><X className="mr-3 flex-shrink-0" size={20} /> No AI Plans</li>
                                    <li className="flex items-center text-slate-400"><X className="mr-3 flex-shrink-0" size={20} /> No Store Discount</li>
                                </ul>
                                <button className="w-full border-2 border-slate-900 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-900 hover:text-white transition-colors uppercase text-sm tracking-wide">Join Now</button>
                            </div>
                        </motion.div>

                        {/* Card 2 - Featured */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden transform md:-mt-8 border-t-4 border-blue-500 relative z-10"
                        >
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-sm">Most Popular</div>
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center">
                                <h3 className="text-xl font-bold uppercase tracking-wider">Premium AI</h3>
                                <div className="text-5xl font-extrabold mt-4 mb-2">$49<span className="text-xl font-normal text-blue-200">/mo</span></div>
                                <p className="text-blue-100 text-sm opacity-90">Includes 7-day free trial</p>
                            </div>
                            <div className="p-8">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-slate-800 font-semibold"><CheckCircle className="text-blue-500 mr-3 flex-shrink-0" size={20} /> All Standard Features</li>
                                    <li className="flex items-center text-slate-800 font-semibold"><CheckCircle className="text-blue-500 mr-3 flex-shrink-0" size={20} /> AI Workout & Diet Plans</li>
                                    <li className="flex items-center text-slate-700 font-medium"><CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} /> 5% Store Discount</li>
                                    <li className="flex items-center text-slate-700 font-medium"><CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} /> Priority Support</li>
                                </ul>
                                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all uppercase text-sm tracking-wide transform hover:scale-[1.02]">Start Free Trial</button>
                            </div>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
                        >
                            <div className="bg-slate-900 p-8 text-white text-center">
                                <h3 className="text-xl font-bold uppercase tracking-wider">Elite</h3>
                                <div className="text-5xl font-extrabold mt-4 mb-2">$89<span className="text-xl font-normal text-slate-400">/mo</span></div>
                            </div>
                            <div className="p-8">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-slate-700 font-medium"><CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} /> All Premium Features</li>
                                    <li className="flex items-center text-slate-700 font-medium"><CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} /> Personal Trainer (2x/mo)</li>
                                    <li className="flex items-center text-slate-700 font-medium"><CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} /> 15% Store Discount</li>
                                    <li className="flex items-center text-slate-700 font-medium"><CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} /> Sauna Access</li>
                                </ul>
                                <button className="w-full border-2 border-slate-900 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-900 hover:text-white transition-colors uppercase text-sm tracking-wide">Join Now</button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Offers;

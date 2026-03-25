import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Shop = () => {
    return (
        <div className="font-sans text-slate-800">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-orange-50 to-red-50 min-h-[40vh] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-600 text-sm font-semibold mb-6">
                            Gear Up
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900">
                            Shop Latest Arrivals
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Discover premium fitness gear and supplements to enhance your workout experience.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: item * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden mb-4 relative shadow-sm">
                                    <img
                                        src={`https://images.unsplash.com/photo-${item === 1 ? '1517836357463-c25dfe1b9000' :
                                                item === 2 ? '1583454110551-21f2fa2afe61' :
                                                    item === 3 ? '1556817411-31ae72fa3ea0' :
                                                        item === 4 ? '1591324567110-988db7e61881' :
                                                            item === 5 ? '1584735935682-2f8b6a6e6b7a' :
                                                                item === 6 ? '1571902943202-507ec2618e8f' :
                                                                    item === 7 ? '1606902965551-dce093cda6e7' :
                                                                        '1434682881908-b0d58cd49e64'
                                            }?q=80&w=600&auto=format&fit=crop`}
                                        alt="Product"
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    {item % 3 === 1 && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">New</span>}
                                    <button className="absolute bottom-4 right-4 bg-white text-slate-900 p-2 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {item % 4 === 1 ? 'Performance Tee' : item % 4 === 2 ? 'Training Shorts' : item % 4 === 3 ? 'Protein Powder' : 'Gym Bag'}
                                </h3>
                                <p className="text-slate-500 text-sm mb-2">
                                    {item % 4 === 1 ? "Men's Training Gear" : item % 4 === 2 ? "Women's Activewear" : item % 4 === 3 ? "Nutrition" : "Accessories"}
                                </p>
                                <span className="block font-bold text-slate-900">${(item * 5 + 20)}.00</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Shop;

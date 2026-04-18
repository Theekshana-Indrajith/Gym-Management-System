import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
    return (
        <div className="font-sans text-slate-800">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-purple-50 to-pink-50 min-h-[40vh] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-600 text-sm font-semibold mb-6">
                            Get In Touch
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900">
                            Contact Us
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Form and Info */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-6 text-slate-900">Send Us a Message</h2>
                            <form className="space-y-6" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = {
                                    name: e.target[0].value,
                                    email: e.target[1].value,
                                    subject: e.target[2].value,
                                    message: e.target[3].value
                                };
                                try {
                                    await axios.post('http://localhost:8080/api/public/inquiry', formData);
                                    alert("Your message has been received! Our team will contact you soon.");
                                    e.target.reset();
                                } catch (err) {
                                    alert("Failed to send message. Please try again later.");
                                }
                            }}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Name</label>
                                        <input
                                            type="text" required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email</label>
                                        <input
                                            type="email" required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Subject</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Message</label>
                                    <textarea
                                        rows="6" required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                                        placeholder="Your message..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    Send Message
                                </button>
                            </form>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-bold mb-6 text-slate-900">Contact Information</h2>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                Feel free to reach out to us through any of the following channels. Our team is here to help you with any questions or concerns.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-xl">
                                        <Mail className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                                        <p className="text-slate-600">info@musclehub.com</p>
                                        <p className="text-slate-600">musclehubplus@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 p-3 rounded-xl">
                                        <Phone className="text-green-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Phone</h3>
                                        <p className="text-slate-600">+94 11 2558 965</p>
                                        <p className="text-slate-600">+94 71 5184 898</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-100 p-3 rounded-xl">
                                        <MapPin className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Address</h3>
                                        <p className="text-slate-600">No. 123, MuscleHub Fitness Center</p>
                                        <p className="text-slate-600">Colombo 03, Sri Lanka</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 bg-slate-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-slate-900 mb-3">Business Hours</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Monday - Friday:</span>
                                        <span className="font-semibold text-slate-900">6:00 AM - 10:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Saturday:</span>
                                        <span className="font-semibold text-slate-900">8:00 AM - 8:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Sunday:</span>
                                        <span className="font-semibold text-slate-900">8:00 AM - 6:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Google Map Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="mt-24"
                    >
                        <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter text-center">Protocol Headquarters</h2>
                        <div className="w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                            <iframe
                                title="MuscleHub Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.782806450893!2d79.96867438730827!3d6.918438169465344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTUnMDYuNCJOIDc5wrA1OCcwNy4yIkU!5e0!3m2!1sen!2slk!4v1711358311000!5m2!1sen!2slk"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                        <div className="mt-8 flex flex-col items-center">
                            <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl">
                                <MapPin className="text-blue-500" size={20} />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">MuscleHub Elite HQ • Colombo, Sri Lanka</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;

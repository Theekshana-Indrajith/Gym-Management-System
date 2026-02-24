import React from 'react';
import { Building2, Facebook, Twitter, Instagram } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();
    const isDashboard = location.pathname.includes('/admin') ||
        location.pathname.includes('/trainer') ||
        location.pathname.includes('/member');

    return (
        <footer className={`bg-slate-950 text-slate-400 py-8 border-t border-slate-800 relative z-40 transition-all duration-300 ${isDashboard ? 'md:ml-64' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10">
                    {/* Brand */}
                    <div className="flex items-center lg:items-start flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2.5 rounded-lg shadow-lg shadow-blue-500/20">
                                <Building2 size={22} className="text-white" />
                            </div>
                            <span className="text-2xl font-black text-white uppercase tracking-tight">Muscle<span className="text-blue-500">Hub</span></span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Premium Fitness Management</p>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 w-full lg:w-auto text-center md:text-left">
                        <div>
                            <a href="#" className="block font-bold text-slate-300 hover:text-blue-500 transition-colors mb-1.5 text-sm tracking-wide">About Us</a>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Our gym's vision, story & core mission.</p>
                        </div>
                        <div>
                            <a href="#" className="block font-bold text-slate-300 hover:text-blue-500 transition-colors mb-1.5 text-sm tracking-wide">Services</a>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">AI plans, top-tier trainers & facilities.</p>
                        </div>
                        <div>
                            <a href="#" className="block font-bold text-slate-300 hover:text-blue-500 transition-colors mb-1.5 text-sm tracking-wide">Contact</a>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">24/7 dedicated support & inquiry line.</p>
                        </div>
                        <div>
                            <a href="#" className="block font-bold text-slate-300 hover:text-blue-500 transition-colors mb-1.5 text-sm tracking-wide">Privacy Policy</a>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Data security, user safety & terms.</p>
                        </div>
                    </div>

                    {/* Socials & Contact */}
                    <div className="flex items-center justify-center gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-md">
                            <Facebook size={16} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-400 hover:border-blue-400 hover:text-white transition-all shadow-md">
                            <Twitter size={16} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-pink-600 hover:border-pink-600 hover:text-white transition-all shadow-md">
                            <Instagram size={16} />
                        </a>
                    </div>
                </div>

                <div className="border-t border-slate-800/60 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-2">
                    <p>© {new Date().getFullYear()} MuscleHub. All rights reserved.</p>
                    <p className="flex items-center gap-2">
                        <span>Colombo, Sri Lanka</span> | <span>011-2224455</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

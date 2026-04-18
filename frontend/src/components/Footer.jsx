import React from 'react';
import { Facebook, Twitter, Instagram, Box } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center">
            <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 border-b border-slate-800 pb-8">

                <div className="flex flex-col gap-4 max-w-[200px]">
                    <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                        <Box size={24} className="text-white bg-blue-600 p-1 rounded min-w-[32px] min-h-[32px]" /> MUSCLEHUB
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500">Premium Fitness Management</p>
                </div>

                <div className="flex flex-1 justify-around gap-4 text-[11px]">
                    <div>
                        <h4 className="text-white font-bold mb-4 text-[13px] font-display uppercase tracking-wider">About Us</h4>
                        <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                            <li>Our gym's vision, story & core mission.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 text-[13px] font-display uppercase tracking-wider">Services</h4>
                        <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                            <li>AI plans, top-tier trainers & facilities.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 text-[13px] font-display uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                            <li>24/7 dedicated support & inquiry line.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 text-[13px] font-display uppercase tracking-wider">Privacy Policy</h4>
                        <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                            <li>Data security, user safety & terms.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-slate-400">
                        <Facebook size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors text-slate-400">
                        <Twitter size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors text-slate-400">
                        <Instagram size={14} />
                    </button>
                </div>
            </div>
            <div className="max-w-7xl w-full mx-auto flex justify-between items-center text-[10px] mt-8 text-slate-600 font-semibold tracking-wide">
                <p>&copy; 2026 MuscleHub. All rights reserved.</p>
                <div className="flex gap-4">
                    <p>Colombo, Sri Lanka</p>
                    <span className="opacity-30">|</span>
                    <p>011-2224455</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

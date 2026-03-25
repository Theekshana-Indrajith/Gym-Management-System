import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { Gift, Plus, Ticket, Star, Percent, Trash2, Box, Facebook, Twitter, Instagram } from 'lucide-react';

const OffersPromotionsAdmin = () => {
    const [offers, setOffers] = useState([
        { id: 1, title: "New Year Blast", code: "NY2024", discount: "25%", status: "ACTIVE" },
        { id: 2, title: "Summer Shred", code: "SUMMER50", discount: "50%", status: "EXPIRED" }
    ]);

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <AdminSidebar activePage="offers" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <AdminHeader title="" subtitle="Create seasonal discounts and manage the loyalty rewards program." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Offers & Promotions</h2>
                                <p className="text-slate-300 font-medium">Manage seasonal discounts and loyalty programs.</p>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                <Plus size={20} /> Create Promo
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full relative z-20 mt-6 grid lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 text-white flex items-center justify-center p-8 rounded-bl-[4rem] opacity-90 group-hover:scale-110 transition-transform origin-top-right">
                            <Gift size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-8 border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">Active Discounts</h3>
                        <div className="space-y-4">
                            {offers.map((offer) => (
                                <div key={offer.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group/item hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <Ticket size={24} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 leading-none mb-1 text-lg">{offer.title}</h4>
                                            <p className="text-xs font-black text-blue-600 tracking-widest">{offer.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-2xl font-black text-slate-900">{offer.discount} OFF</span>
                                        <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
                            <Star className="absolute right-[-5%] top-[-10%] w-64 h-64 text-slate-800 opacity-50" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 tracking-tighter uppercase">
                                    <Star className="text-amber-400" /> Loyalty Program
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Points Per Check-in</span>
                                        <span className="font-black text-emerald-400 text-xl tracking-tighter">+50 PTS</span>
                                    </div>
                                    <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Referral Bonus</span>
                                        <span className="font-black text-blue-400 text-xl tracking-tighter">500 PTS</span>
                                    </div>
                                    <button className="w-full py-5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 hover:border-white/20 transition-all">Configure Parameters</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:shadow-blue-500/20 hover:-translate-y-1 transition-all">
                            <Percent size={120} className="absolute right-[-10%] bottom-[-10%] text-white/10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase">Campaign Performance</h3>
                            <p className="text-blue-100 text-sm mb-8 max-w-[220px] leading-relaxed font-medium">See how your active promo codes are boosting gym traffic and engagement.</p>
                            <button className="bg-white text-blue-700 font-black px-8 py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg shadow-black/10">Analytics Dashboard</button>
                        </div>
                    </div>
                </div>

                <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center relative z-20">
                    <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 border-b border-slate-800 pb-8">
                        <div className="flex flex-col gap-4 max-w-[200px]">
                            <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                                <Box size={24} className="text-white bg-blue-600 p-1 rounded min-w-[32px] min-h-[32px]" /> MUSCLEHUB
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-500">Premium Fitness Management</p>
                        </div>
                        <div className="flex flex-1 justify-around gap-4 text-[11px]">
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-display">About Us</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>Our gym's vision, story & core mission.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-display">Services</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>AI plans, top-tier trainers & facilities.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-display">Contact</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>24/7 dedicated support & inquiry line.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-display">Privacy Policy</h4>
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
                        <p>Colombo, Sri Lanka <span className="mx-2">|</span> 011-2224455</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default OffersPromotionsAdmin;

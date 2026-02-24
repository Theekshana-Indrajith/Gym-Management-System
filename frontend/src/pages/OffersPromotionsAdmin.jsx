import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { Gift, Plus, Ticket, Star, Percent, Trash2 } from 'lucide-react';

const OffersPromotionsAdmin = () => {
    const [offers, setOffers] = useState([
        { id: 1, title: "New Year Blast", code: "NY2024", discount: "25%", status: "ACTIVE" },
        { id: 2, title: "Summer Shred", code: "SUMMER50", discount: "50%", status: "EXPIRED" }
    ]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar activePage="offers" />
            <main className="ml-64 flex-1 p-10">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Offers & Promotions</h1>
                        <p className="text-slate-500 font-medium">Create seasonal discounts and manage the loyalty rewards program.</p>
                    </div>
                    <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                        <Plus size={20} /> Create Promo
                    </button>
                </header>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 text-white flex items-center justify-center p-8 rounded-bl-[4rem]">
                            <Gift size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-8">Active Discounts</h3>
                        <div className="space-y-4">
                            {offers.map((offer) => (
                                <div key={offer.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <Ticket size={24} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 leading-none mb-1">{offer.title}</h4>
                                            <p className="text-xs font-black text-blue-600 tracking-widest">{offer.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-2xl font-black text-slate-900">{offer.discount} OFF</span>
                                        <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Star className="text-orange-400" /> Loyalty Program
                            </h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-slate-400 font-medium">Points Per Check-in</span>
                                    <span className="font-black text-emerald-400 text-xl">+50 PTS</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-slate-400 font-medium">Referral Bonus</span>
                                    <span className="font-black text-blue-400 text-xl">500 PTS</span>
                                </div>
                                <button className="w-full py-4 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all">Configure Parameters</button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
                            <Percent size={120} className="absolute right-[-10%] bottom-[-10%] text-white/10 group-hover:rotate-12 transition-transform duration-500" />
                            <h3 className="text-2xl font-bold mb-2">Campaign Performance</h3>
                            <p className="text-blue-100 text-sm mb-6 max-w-[200px]">See how your active promo codes are boosting gym traffic.</p>
                            <button className="bg-white text-blue-700 font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest">Analytics Dashboard</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OffersPromotionsAdmin;

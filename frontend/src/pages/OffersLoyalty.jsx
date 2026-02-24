import React from 'react';
import MemberSidebar from '../components/MemberSidebar';
import MemberPageBanner from '../components/MemberPageBanner';
import { Gift, Zap, Crown, ArrowRight, Tag } from 'lucide-react';

const OffersLoyalty = () => {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100">
            <MemberSidebar activePage="offers" />
            <main className="ml-64 flex-1 p-6">
                <MemberPageBanner title="Offers & Loyalty" subtitle="Exclusive rewards for your fitness milestones" icon={Gift} />

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group h-fit">
                        <Zap className="absolute right-[-10%] top-[-10%] w-48 h-48 text-white/10 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <Crown className="text-white fill-white" /> Member Status
                            </h3>
                            <div className="mb-10 text-center">
                                <p className="text-xs font-black uppercase tracking-widest text-yellow-100 mb-2">Available Points</p>
                                <p className="text-7xl font-black">1,450</p>
                            </div>
                            <button className="w-full bg-white text-orange-600 font-black py-4 rounded-2xl hover:bg-orange-50 transition-colors shadow-lg">
                                Redeem Points
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
                                <Tag className="text-blue-500" /> Active Discounts
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { title: "20% Off Supplements", desc: "Valid on all Whey Protein products this week.", code: "SUPP20", color: "bg-blue-50 text-blue-600" },
                                    { title: "Free PT Session", desc: "Redeemable after 1000 loyalty points.", code: "FREETRAIN", color: "bg-purple-50 text-purple-600" },
                                    { title: "Gear Shop Special", extra: "BUY 1 GET 1", desc: "On all MuscleHub branded apparel.", code: "MHGEAR", color: "bg-emerald-50 text-emerald-600" },
                                ].map((offer, i) => (
                                    <div key={i} className="flex items-center justify-between p-8 rounded-3xl border border-slate-50 hover:border-slate-100 bg-slate-50/30 group transition-all">
                                        <div>
                                            {offer.extra && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full mb-2 inline-block tracking-tighter">{offer.extra}</span>}
                                            <h4 className="text-xl font-bold text-slate-900 mb-1">{offer.title}</h4>
                                            <p className="text-slate-400 text-sm font-medium">{offer.desc}</p>
                                        </div>
                                        <div className={`px-6 py-3 rounded-2xl font-black border border-current ${offer.color}`}>
                                            {offer.code}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl flex items-center justify-between group cursor-pointer hover:bg-black transition-colors">
                        <div>
                            <h3 className="text-2xl font-black mb-2">Refer a Friend</h3>
                            <p className="text-slate-400 font-medium">Earn 500 points for every referral.</p>
                        </div>
                        <div className="p-5 bg-white/10 rounded-2xl group-hover:bg-blue-600 transition-all">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OffersLoyalty;

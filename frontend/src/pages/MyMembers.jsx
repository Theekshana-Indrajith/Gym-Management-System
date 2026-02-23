import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import { Users, Search, Activity, Heart, ExternalLink } from 'lucide-react';
import axios from 'axios';
import TrainerPageBanner from '../components/TrainerPageBanner';

const MyMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const res = await axios.get('http://localhost:8080/api/trainer/my-members', {
                    headers: { Authorization: auth }
                });
                setMembers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-100 to-slate-100">
            <TrainerSidebar activePage="members" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <TrainerPageBanner title="My Members" subtitle="Monitor and manage the progress of your athletes." icon={Users} />

                <div className="mb-8 flex justify-end">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search members..." className="pl-12 pr-6 py-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 w-80 font-medium" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {members.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                        >
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center font-black text-2xl">
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{member.username}</h3>
                                    <p className="text-slate-400 text-sm font-medium">{member.email}</p>
                                </div>
                                <button className="ml-auto p-3 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                    <ExternalLink size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Weight</p>
                                    <p className="text-lg font-black text-slate-900">{member.weight || '--'} kg</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Age</p>
                                    <p className="text-lg font-black text-slate-900">{member.age || '--'} yrs</p>
                                </div>
                                <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase mb-1 opacity-70">Loyalty</p>
                                    <p className="text-lg font-black">{member.loyaltyPoints || 0}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Activity size={16} className="text-blue-500" />
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Goal: 65%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {members.length === 0 && (
                        <div className="col-span-2 text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                            <Users className="mx-auto mb-4 text-slate-300" size={48} />
                            <p className="text-slate-400 font-bold">No members assigned to you yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyMembers;

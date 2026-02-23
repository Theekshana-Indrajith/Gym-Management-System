import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import { Users, Calendar, Activity, CheckCircle, TrendingUp, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import TrainerPageBanner from '../components/TrainerPageBanner';

const TrainerDashboard = () => {
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
            <TrainerSidebar activePage="dashboard" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <TrainerPageBanner title="Trainer Dashboard" subtitle={`You have ${members.length} active members under your guidance today. Start by checking your schedule.`} icon={LayoutDashboard} />

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <Users size={32} className="text-emerald-500 mb-4" />
                        <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Total Members</h3>
                        <p className="text-4xl font-black text-slate-900">{members.length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <CheckCircle size={32} className="text-blue-500 mb-4" />
                        <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Sessions Completed</h3>
                        <p className="text-4xl font-black text-slate-900">12</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <TrendingUp size={32} className="text-orange-500 mb-4" />
                        <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Success Rate</h3>
                        <p className="text-4xl font-black text-slate-900">94%</p>
                    </div>
                </div>

                <div className="mt-10 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {members.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
                                <div>
                                    <p className="font-bold text-lg">{m.username}</p>
                                    <p className="text-sm text-slate-400">Assigned 2 days ago</p>
                                </div>
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">Active</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TrainerDashboard;

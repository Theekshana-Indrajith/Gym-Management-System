import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { ShieldCheck, Plus, ArrowRight, UserCheck, ShieldPlus, Users as UsersIcon } from 'lucide-react';
import axios from 'axios';
import AdminPageBanner from '../components/AdminPageBanner';

const ManageTrainersAdmin = () => {
    const [trainers, setTrainers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [newTrainer, setNewTrainer] = useState({ username: '', email: '', password: '', role: 'TRAINER' });

    const fetchData = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/admin/trainers', { headers: { Authorization: auth } });
            setTrainers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddTrainer = async (e) => {
        e.preventDefault();
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/admin/add-user', newTrainer, {
                headers: { Authorization: auth }
            });
            alert("Trainer added successfully!");
            setNewTrainer({ username: '', email: '', password: '', role: 'TRAINER' });
            fetchData();
        } catch (err) {
            alert("Failed to add trainer");
        }
    };



    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-slate-100">
            <AdminSidebar activePage="trainers" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <AdminPageBanner title="Trainer Management" subtitle="Onboard fitness experts and assign them to your members." icon={UsersIcon} />

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-8">
                        {/* Onboard Form */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <ShieldPlus className="text-blue-600" /> Onboard Expert
                            </h3>
                            <form onSubmit={handleAddTrainer} className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={newTrainer.username}
                                        onChange={(e) => setNewTrainer({ ...newTrainer, username: e.target.value })}
                                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Trainer Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newTrainer.email}
                                        onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="trainer@musclehub.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={newTrainer.password}
                                        onChange={(e) => setNewTrainer({ ...newTrainer, password: e.target.value })}
                                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    Register Trainer <Plus size={18} />
                                </button>
                            </form>
                        </div>


                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl min-h-[600px]">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <ShieldCheck className="text-purple-500" /> Active Personnel
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {trainers.map((t) => (
                                    <div key={t.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-purple-200 transition-all">
                                        <div className="flex items-center gap-5 mb-4">
                                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                                                {t.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 leading-none mb-1">{t.username}</h4>
                                                <p className="text-xs text-slate-400 font-medium">Head Coach</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-black">
                                                <UserCheck size={14} /> 05 MEMBERS
                                            </div>
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-black uppercase">Online</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManageTrainersAdmin;

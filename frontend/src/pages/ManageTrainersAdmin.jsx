import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { ShieldCheck, Plus, ArrowRight, UserCheck, ShieldPlus, Box, Facebook, Twitter, Instagram, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import axios from 'axios';

const ManageTrainersAdmin = () => {
    const [trainers, setTrainers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [newTrainer, setNewTrainer] = useState({ username: '', email: '', password: '', role: 'TRAINER' });
    const [searchQuery, setSearchQuery] = useState('');

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

        // 1. Username Validation: No numbers allowed
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(newTrainer.username)) {
            alert("Names/Usernames should only contain letters. Numbers are not allowed.");
            return;
        }

        // 2. Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newTrainer.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // 3. Password Validation: At least 6 characters
        if (newTrainer.password.length < 6) {
            alert("Security Alert: Password must be at least 6 characters long.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/admin/add-user', newTrainer, {
                headers: { Authorization: auth }
            });
            alert("Trainer added successfully!");
            setNewTrainer({ username: '', email: '', password: '', role: 'TRAINER' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add trainer");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/admin/users/${id}/toggle-status`, {}, {
                headers: { Authorization: auth }
            });
            fetchData();
        } catch (err) {
            alert("Failed to change status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this trainer?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
                headers: { Authorization: auth }
            });
            fetchData();
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <AdminSidebar activePage="trainers" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <AdminHeader title="" subtitle="Onboard fitness experts and assign them to your members." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Trainer Management</h2>
                                <p className="text-slate-300 font-medium">Add, review, and control coaching staff.</p>
                            </div>
                            <div className="relative group min-w-[350px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search trainers by name..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-500 transition-all shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full relative z-20 mt-6 grid lg:grid-cols-3 gap-10">
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
                                        autoComplete="off"
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
                                        autoComplete="off"
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
                                        autoComplete="new-password"
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
                                {trainers.filter(t => t.username.toLowerCase().includes(searchQuery.toLowerCase())).map((t) => (
                                    <div key={t.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-purple-200 transition-all relative overflow-hidden">
                                        <div className="flex items-center gap-5 mb-4">
                                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                                                {t.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 leading-none mb-1">{t.username}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{t.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${t.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${t.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.isActive ? 'Active' : 'Deactivated'}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => handleToggleStatus(t.id)}
                                                    title={t.isActive ? "Deactivate" : "Activate"}
                                                    className={`p-2 rounded-lg transition-all ${t.isActive ? 'text-emerald-500 hover:bg-emerald-100' : 'text-red-400 hover:bg-red-100'}`}
                                                >
                                                    {t.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(t.id)}
                                                    title="Delete Trainer"
                                                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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

export default ManageTrainersAdmin;

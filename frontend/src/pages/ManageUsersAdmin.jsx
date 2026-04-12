import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { UserPlus, User, Trash2, Edit2, CheckCircle, XCircle, Shield, Search, Box, Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';

const ManageUsersAdmin = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'MEMBER' });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/admin/members', {
                headers: { Authorization: auth }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();

        // 1. Username Validation: No numbers allowed
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(formData.username)) {
            alert("Names/Usernames should only contain letters. Numbers are not allowed.");
            return;
        }

        // 2. Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // 3. Password Validation: At least 6 characters
        if (formData.password.length < 6) {
            alert("Security Alert: Password must be at least 6 characters long.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/admin/add-user', formData, {
                headers: { Authorization: auth }
            });
            setShowForm(false);
            setFormData({ username: '', email: '', password: '', role: 'MEMBER' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Action failed");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/admin/users/${id}/toggle-status`, {}, {
                headers: { Authorization: auth }
            });
            fetchUsers();
        } catch (err) {
            alert("Failed to change user status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
                headers: { Authorization: auth }
            });
            fetchUsers();
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <AdminSidebar activePage="users" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <AdminHeader title="" subtitle="Register, monitor, and regulate gym memberships." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">User Management</h2>
                                <p className="text-slate-300 font-medium">Keep track of gym members.</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="relative group min-w-[300px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search members..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-500 transition-all"
                                    />
                                </div>
                                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                                    <UserPlus size={20} /> {showForm ? 'Cancel' : 'Add Member'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full relative z-20 mt-6">
                    {showForm && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-10 max-w-2xl">
                            <h3 className="text-2xl font-black mb-8">Member Information</h3>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <input type="text" placeholder="Username" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} autoComplete="off" />
                                    <input type="email" placeholder="Email Address" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} autoComplete="off" />
                                </div>
                                <input type="password" placeholder="Initial Password" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} autoComplete="new-password" />
                                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all">Enable Membership</button>
                            </form>
                        </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                            <div key={user.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                        <User size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleToggleStatus(user.id)} 
                                            title={user.isActive ? "Deactivate User" : "Activate User"}
                                            className={`p-3 rounded-xl transition-all ${user.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-400 hover:bg-red-50'}`}
                                        >
                                            {user.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-1 leading-none">{user.username}</h3>
                                <p className="text-slate-400 text-sm font-medium mb-6 uppercase tracking-widest">{user.role}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                        <span className={`text-xs font-black uppercase tracking-tighter ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {user.isActive ? 'Access Granted' : 'Access Revoked'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
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

export default ManageUsersAdmin;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { UserPlus, User, Trash2, Edit2, CheckCircle, XCircle, Shield, Search, Users as UsersIcon } from 'lucide-react';
import axios from 'axios';
import AdminPageBanner from '../components/AdminPageBanner';

const ManageUsersAdmin = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'MEMBER' });
    const [loading, setLoading] = useState(true);

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


    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-slate-100">
            <AdminSidebar activePage="users" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <AdminPageBanner title="User Management" subtitle="Register, monitor, and regulate gym memberships." icon={UsersIcon} />

                <div className="mb-8 flex justify-end">
                    <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                        <UserPlus size={20} /> {showForm ? 'Cancel' : 'Register New Member'}
                    </button>
                </div>

                {showForm && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-10 max-w-2xl">
                        <h3 className="text-2xl font-black mb-8">Member Information</h3>
                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <input type="text" placeholder="Username" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                <input type="email" placeholder="Email Address" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <input type="password" placeholder="Initial Password" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all">Enable Membership</button>
                        </form>
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {users.map((user) => (
                        <div key={user.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                    <User size={24} />
                                </div>
                                <div className="flex gap-2">
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1 leading-none">{user.username}</h3>
                            <p className="text-slate-400 text-sm font-medium mb-6 uppercase tracking-widest">{user.role}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">Active Member</span>
                                </div>
                                <button className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">Edit Profile</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ManageUsersAdmin;

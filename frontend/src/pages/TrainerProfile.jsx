import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, Phone, Calendar, Users, Save, CheckCircle } from 'lucide-react';
import axios from 'axios';
import TrainerSidebar from '../components/TrainerSidebar';
import TrainerHeader from '../components/TrainerHeader';

const TrainerProfile = () => {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        age: '',
        gender: '',
        qualification: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const res = await axios.get('http://localhost:8080/api/trainer/profile', {
                    headers: { Authorization: auth }
                });
                setFormData(res.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.put('http://localhost:8080/api/trainer/profile', formData, {
                headers: { Authorization: auth }
            });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    if (loading) return null;

    return (
        <div className="flex min-h-screen bg-emerald-50 font-sans">
            <TrainerSidebar activePage="profile" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <TrainerHeader title="My Profile" subtitle="Manage your professional information" lightTheme={true} />
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">
                    <div className="max-w-4xl">
                        {message && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-6 rounded-[2rem] mb-8 flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <CheckCircle size={20} />
                                </div>
                                <span className="font-bold">{message}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input name="firstName" value={formData.firstName || ''} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input name="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input value={formData.username} disabled className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 outline-none font-bold cursor-not-allowed" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input name="email" value={formData.email || ''} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold" placeholder="e.g. 0771234567" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Age</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input name="age" type="number" value={formData.age || ''} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Professional Qualifications</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-4 top-6 text-slate-400" size={20} />
                                    <textarea 
                                        name="qualification" 
                                        value={formData.qualification || ''} 
                                        onChange={handleChange} 
                                        placeholder="Enter your certifications, experience, and expertise..."
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold h-32"
                                    ></textarea>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-95">
                                <Save size={24} /> Save Profile Changes
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TrainerProfile;

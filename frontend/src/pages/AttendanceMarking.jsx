import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import TrainerHeader from '../components/TrainerHeader';
import { User, CheckCircle, XCircle, Clock, Calendar, Box, Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';

const AttendanceMarking = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(null);

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

    const markAttendance = async (userId, status) => {
        setMarking(userId);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/trainer/attendance', {
                memberId: userId,
                status: status
            }, { headers: { Authorization: auth } });

            // Temporary feedback
            alert(`Marked ${status} for user`);
        } catch (err) {
            alert("Failed to mark attendance");
        } finally {
            setMarking(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <TrainerSidebar activePage="attendance" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <TrainerHeader title="" subtitle="Daily gym check-ins for your assigned members." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Attendance Portal</h2>
                                <p className="text-slate-300 font-medium">Daily gym check-ins for your assigned members.</p>
                            </div>
                            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3 shadow-sm backdrop-blur-sm">
                                <Calendar size={20} className="text-emerald-400" />
                                <span className="font-black text-white">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Member Name</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Joined Date</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {members.map((member, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                    <User size={20} />
                                                </div>
                                                <span className="font-bold text-slate-900">{member.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-500 font-medium">
                                            {member.joinedDate || 'Recently'}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-3">
                                                <button
                                                    disabled={marking === member.id}
                                                    onClick={() => markAttendance(member.id, 'PRESENT')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <CheckCircle size={18} /> Present
                                                </button>
                                                <button
                                                    disabled={marking === member.id}
                                                    onClick={() => markAttendance(member.id, 'ABSENT')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <XCircle size={18} /> Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {members.length === 0 && (
                            <div className="py-20 text-center opacity-30 italic font-medium">No members found to mark attendance.</div>
                        )}
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

export default AttendanceMarking;

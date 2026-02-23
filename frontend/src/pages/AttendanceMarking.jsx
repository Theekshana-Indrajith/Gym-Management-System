import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import { User, CheckCircle, XCircle, Clock, Calendar, ClipboardCheck } from 'lucide-react';
import axios from 'axios';
import TrainerPageBanner from '../components/TrainerPageBanner';

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
        <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-100 to-slate-100">
            <TrainerSidebar activePage="attendance" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <TrainerPageBanner title="Attendance Portal" subtitle="Daily gym check-ins for your assigned members." icon={ClipboardCheck} />

                <div className="mb-8 flex justify-end">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
                        <Calendar size={20} className="text-emerald-500" />
                        <span className="font-black text-slate-700">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

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
            </main>
        </div>
    );
};

export default AttendanceMarking;

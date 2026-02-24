import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MemberSidebar from '../components/MemberSidebar';
import { LineChart, ArrowUpRight, ArrowDownRight, Activity, TrendingUp } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';
import { useNavigate } from 'react-router-dom';
import MemberPageBanner from '../components/MemberPageBanner';

const MyProgress = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const profileRes = await axios.get('http://localhost:8080/api/member/profile', {
                    headers: { Authorization: auth }
                });

                if (profileRes.data.membershipStatus !== 'ACTIVE') {
                    navigate('/member/membership');
                    return;
                }

                const res = await axios.get('http://localhost:8080/api/member/progress', {
                    headers: { Authorization: auth }
                });
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [navigate]);

    // Reverse logs to be chronological for the chart
    const chronologicalLogs = [...logs].reverse();
    const weightData = chronologicalLogs.map(l => l.weight);
    const bmiData = chronologicalLogs.map(l => l.bmi);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100">
            <MemberSidebar activePage="progress" />
            <main className="ml-64 flex-1 p-6">
                <MemberPageBanner title="My Progress" subtitle="Track your fitness journey over time" icon={TrendingUp} />

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                    <h3 className="text-2xl font-black mb-8">Recent Logs</h3>
                    <div className="space-y-4">
                        {logs.slice().reverse().map((log, i) => (
                            <div key={i} className="grid grid-cols-4 items-center p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                <span className="font-bold text-slate-400">{new Date(log.logDate).toLocaleDateString()}</span>
                                <span className="font-black text-lg">{log.weight} kg</span>
                                <span className="font-black text-lg text-blue-400">{log.bmi.toFixed(1)} BMI</span>
                                <span className="text-right text-emerald-400 font-black flex items-center justify-end gap-1">
                                    <ArrowUpRight size={16} /> Record
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && <p className="text-center text-slate-500 py-10 italic">No logs found yet. Start by updating your profile!</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyProgress;

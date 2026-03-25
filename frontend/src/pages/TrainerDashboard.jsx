import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import TrainerHeader from '../components/TrainerHeader';
import { Users, Calendar, Activity, CheckCircle, TrendingUp, Box, Facebook, Twitter, Instagram, X, ArrowUpRight, LineChart as LineChartIcon } from 'lucide-react';
import axios from 'axios';

const TrainerDashboard = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [progressData, setProgressData] = useState([]);
    const [showProgressModal, setShowProgressModal] = useState(false);

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

    const fetchMemberProgress = async (member) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get(`http://localhost:8080/api/trainer/member/${member.id}/progress`, {
                headers: { Authorization: auth }
            });
            setProgressData(res.data);
            setSelectedMember(member);
            setShowProgressModal(true);
        } catch (err) {
            console.error("Failed to fetch progress", err);
            alert("Could not load member progress.");
        }
    };

    const RadarChart = ({ data }) => {
        const labels = ['Chest', 'Waist', 'Biceps', 'Thighs'];
        const latest = data && data.length > 0 ? data[data.length - 1] : {};
        const values = [latest.chest || 0, latest.waist || 0, latest.biceps || 0, latest.thighs || 0];
        const maxVal = Math.max(...values, 40);
        
        const size = 250;
        const center = size / 2;
        const radius = size * 0.4;
        
        const getPoint = (val, i, total) => {
            const factor = (val / maxVal) * radius;
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
            return {
                x: center + factor * Math.cos(angle),
                y: center + factor * Math.sin(angle)
            };
        };

        const polygonPoints = values.map((v, i) => {
            const p = getPoint(v, i, values.length);
            return `${p.x},${p.y}`;
        }).join(' ');

        return (
            <div className="flex flex-col items-center">
                <svg width={size} height={size} className="overflow-visible">
                    {[0.2, 0.4, 0.6, 0.8, 1].map((f, idx) => (
                        <circle key={idx} cx={center} cy={center} r={radius * f} fill="none" stroke="#e2e8f0" strokeOpacity="0.1" strokeDasharray="4" />
                    ))}
                    {labels.map((_, i) => {
                        const p = getPoint(maxVal, i, labels.length);
                        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
                    })}
                    <motion.polygon
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        points={polygonPoints}
                        fill="rgba(16, 185, 129, 0.2)"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />
                    {labels.map((label, i) => {
                        const p = getPoint(maxVal * 1.3, i, labels.length);
                        return (
                            <text key={i} x={p.x} y={p.y} textAnchor="middle" className="text-[9px] font-black fill-slate-500 uppercase tracking-widest">
                                {label}
                            </text>
                        );
                    })}
                </svg>
            </div>
        );
    };

    const SimpleChart = ({ data, dates, color, id }) => {
        if (!data || data.length < 2) return <div className="h-48 flex items-center justify-center text-slate-400 font-medium bg-slate-800/50 rounded-3xl border border-dashed border-white/10 text-xs text-center px-4">Tracking history initialized. Log more data to generate trends.</div>;

        const max = Math.max(...data) * 1.1;
        const min = Math.min(...data) * 0.9;
        const range = max - min || 1;
        const width = 800;
        const height = 200;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="relative flex flex-col gap-2">
                <div className="relative h-48 w-full bg-slate-800/50 rounded-2xl p-4 border border-white/5 overflow-hidden">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M 0,${height} L ${points} L ${width},${height} Z`}
                            fill={`url(#gradient-${id})`}
                        />
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            d={`M ${points}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                {dates && (
                    <div className="flex justify-between px-2 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                        {dates.map((date, idx) => (
                            <span key={idx} className={idx === 0 || idx === dates.length - 1 || idx % Math.ceil(dates.length/4) === 0 ? 'block' : 'hidden'}>
                                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <TrainerSidebar activePage="dashboard" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <TrainerHeader title="" subtitle="Guide your members to success!" lightTheme={true} />

                        <div className="mt-8 mb-4">
                            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                            </div>
                            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Trainer Dashboard</h2>
                            <p className="text-slate-300 font-medium">You have {members.length} active members under your guidance today. Start by checking your schedule.</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">
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
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col">
                            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                <TrendingUp size={16} className="text-orange-500" /> Quick Access
                            </h3>
                            <div className="grid grid-cols-1 gap-3 h-full">
                                <button 
                                    onClick={() => navigate('/trainer/workout-plans')}
                                    className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl text-blue-600 font-black text-[11px] uppercase hover:bg-blue-600 hover:text-white transition-all group"
                                >
                                    Workout Plans
                                    <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                                <button 
                                    onClick={() => navigate('/trainer/meal-plans')}
                                    className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl text-emerald-600 font-black text-[11px] uppercase hover:bg-emerald-600 hover:text-white transition-all group"
                                >
                                    Meal Plans
                                    <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6">My Members</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {members.map((m, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => fetchMemberProgress(m)}
                                    className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center font-black text-xl">
                                            {m.username.charAt(0).toUpperCase()}
                                        </div>
                                        <Activity size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                    <p className="font-bold text-lg mb-1">{m.username}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-4">View Progress Metrics</p>
                                    <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px]">
                                        <TrendingUp size={12} /> CLICK TO VIEW GRAPH
                                    </div>
                                </div>
                            ))}
                            {members.length === 0 && <p className="text-slate-500 italic col-span-full">No members assigned to you yet.</p>}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showProgressModal && selectedMember && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-slate-900 w-full max-w-4xl rounded-[3rem] p-10 relative shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh] scrollbar-hide"
                            >
                                <button 
                                    onClick={() => setShowProgressModal(false)} 
                                    className="absolute right-8 top-8 text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex items-center gap-6 mb-10">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
                                        {selectedMember.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white">{selectedMember.username}'s Progress</h2>
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Real-time transformation metrics</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-white">Weight Journey</h3>
                                            <Activity size={20} className="text-blue-400" />
                                        </div>
                                        <SimpleChart 
                                            data={progressData.map(l => l.weight)} 
                                            dates={progressData.map(l => l.logDate)} 
                                            color="#3b82f6" 
                                            id="weight" 
                                        />
                                        <div className="flex justify-between mt-4 text-[10px] font-black text-slate-500 uppercase">
                                            <span>Baseline</span>
                                            <span>Latest: {progressData.length > 0 ? progressData[progressData.length-1].weight : '0'} kg</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-white">BMI Transition</h3>
                                            <LineChartIcon size={20} className="text-emerald-400" />
                                        </div>
                                        <SimpleChart 
                                            data={progressData.map(l => l.bmi)} 
                                            dates={progressData.map(l => l.logDate)} 
                                            color="#10b981" 
                                            id="bmi" 
                                        />
                                        <div className="flex justify-between mt-4 text-[10px] font-black text-slate-500 uppercase">
                                            <span>Baseline</span>
                                            <span>Latest: {progressData.length > 0 ? progressData[progressData.length-1].bmi.toFixed(1) : '0'} BMI</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid md:grid-cols-2 gap-8 items-center bg-white/5 rounded-[2rem] p-8 border border-white/10 shadow-2xl">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                            <Activity size={20} className="text-emerald-400" /> Transformation Radar
                                        </h3>
                                        <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 italic opacity-70">
                                            Structural muscle development balance for {selectedMember.username}.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Chest</p>
                                                <p className="text-sm font-black text-white">{progressData.length > 0 ? progressData[progressData.length-1].chest || 0 : 0}"</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Waist</p>
                                                <p className="text-sm font-black text-white">{progressData.length > 0 ? progressData[progressData.length-1].waist || 0 : 0}"</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Biceps</p>
                                                <p className="text-sm font-black text-white">{progressData.length > 0 ? progressData[progressData.length-1].biceps || 0 : 0}"</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Thighs</p>
                                                <p className="text-sm font-black text-white">{progressData.length > 0 ? progressData[progressData.length-1].thighs || 0 : 0}"</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center flex-1">
                                        <RadarChart data={progressData} />
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                                    <div className="flex-1 bg-white/5 p-6 rounded-2xl border border-white/5">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Current Height</p>
                                        <p className="text-2xl font-black text-white">{selectedMember.height || 'N/A'} cm</p>
                                    </div>
                                    <div className="flex-1 bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
                                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Target Status</p>
                                        <p className="text-2xl font-black text-emerald-400">OPTIMIZED</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

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

export default TrainerDashboard;

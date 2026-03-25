import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MemberSidebar from '../components/MemberSidebar';
import { Activity, Flame, Heart, ChevronRight, Clock, Calendar, Box, HeartPulse, Shield, Facebook, Twitter, Instagram, FileText } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';

const MemberDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [progressLogs, setProgressLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const [pRes, sRes, prRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/member/profile', { headers: { Authorization: auth } }),
                    axios.get('http://localhost:8080/api/member/sessions', { headers: { Authorization: auth } }),
                    axios.get('http://localhost:8080/api/member/progress', { headers: { Authorization: auth } })
                ]);
                setProfile(pRes.data);
                setSessions(sRes.data);
                setProgressLogs(prRes.data);

                const localUser = JSON.parse(localStorage.getItem('user'));
                localStorage.setItem('user', JSON.stringify({ ...localUser, membershipStatus: pRes.data.membershipStatus }));
            } catch (err) {
                console.error("Failed to fetch data", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('auth');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const todaySessions = sessions.filter(s => isToday(s.sessionTime)).sort((a, b) => new Date(a.sessionTime) - new Date(b.sessionTime));

    const calculateBMI = () => {
        if (profile?.height && profile?.weight) {
            return (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
        }
        return 'N/A';
    };

    const getBMICategory = () => {
        const bmi = parseFloat(calculateBMI());
        if (isNaN(bmi)) return '';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Healthy';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    const SimpleChart = ({ logs, color, id }) => {
        if (!logs || logs.length < 2) return <div className="h-40 flex items-center justify-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs text-center px-4 italic leading-relaxed">Initialized history.<br/>Update profile weekly to see trends.</div>;

        const data = logs.map(l => l.weight);
        const max = Math.max(...data) * 1.1;
        const min = Math.min(...data) * 0.9;
        const range = max - min || 1;
        const width = 800;
        const height = 180;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="relative flex flex-col gap-2">
                <div className="relative h-44 w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 overflow-hidden shadow-inner">
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
                <div className="flex justify-between px-2 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                    {logs.map((log, idx) => (
                        <span key={idx} className={idx === 0 || idx === logs.length - 1 || idx % Math.ceil(logs.length/4) === 0 ? 'block' : 'hidden'}>
                            {new Date(log.logDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    const navCards = [
        { title: 'Workout Plans', icon: Flame, img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000', link: '/member/workout-plans' },
        { title: 'Meal Plans', icon: FileText, img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000', link: '/member/meal-plans' },
        { title: 'My Progress', icon: Activity, img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000', link: '/member/progress' },
        { title: 'My Profile', icon: Shield, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000', link: '/member/profile' }
    ];

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <MemberSidebar activePage="dashboard" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">

                {/* Hero Section */}
                <div className="relative bg-slate-900 px-8 pt-8 pb-14">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <MemberHeader title="" subtitle="Have a productive workout today!" lightTheme={true} />

                        <div className="mt-8 mb-4">
                            <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-1">Welcome back</p>
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                                {profile?.username || 'theekshana'} <span className="text-2xl">👋</span>
                            </h2>
                            <button 
                                onClick={() => navigate('/member/workout-plans')}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm"
                            >
                                <Activity size={18} /> Start Workout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">

                    {/* Weekly Measurement Reminder */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center animate-pulse">
                                    <Activity size={32} className="text-blue-100" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">Weekly Progress Check-in</h3>
                                    <p className="text-blue-100 text-sm font-medium opacity-90 max-w-lg leading-relaxed">
                                        Consistency is key! Please update your <span className="font-black text-white">Weight, Height, and Body Measurements</span> every week to keep your AI tracking accurate.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/member/profile')}
                                className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 whitespace-nowrap active:scale-95"
                            >
                                Update Measurements Now &rarr;
                            </button>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Activity size={200} />
                        </div>
                    </motion.div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                                <Flame size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Weight</p>
                                <p className="text-lg font-bold text-slate-800">{profile?.weight || '0'} kg</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Height</p>
                                <p className="text-lg font-bold text-slate-800">{profile?.height || '0'} cm</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
                                <Heart size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">BMI</p>
                                <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    {calculateBMI()}
                                    <span className="text-[10px] text-slate-400 font-normal tracking-normal">{getBMICategory()}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Image Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {navCards.map((card, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => navigate(card.link)}
                                className="relative overflow-hidden rounded-xl aspect-[16/7] group cursor-pointer shadow-sm"
                            >
                                <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110`} style={{ backgroundImage: `url('${card.img}')` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10"></div>
                                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                    <div className="text-white/80"><card.icon size={18} /></div>
                                    <div>
                                        <h4 className="text-white font-bold text-[15px]">{card.title}</h4>
                                        <p className="text-slate-300 text-[11px] mt-1 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">Open <ChevronRight size={10} /></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-span-2 bg-blue-600 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between pt-8 pb-5">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Box size={20} />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">CURRENT PLAN</span>
                                    </div>
                                    <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase">Active</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4">{profile?.activePackageName || 'Starter Core'}</h3>
                            </div>
                            <div className="bg-white rounded-lg p-3 px-4 flex justify-between items-center text-slate-800 shadow-md">
                                <span className="text-xs text-slate-500 font-medium tracking-wide">Rs.{profile?.activePackagePrice || '35'} • {profile?.activePackageDuration || '1'} months</span>
                                <button 
                                    onClick={() => navigate('/member/membership')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-1"
                                >
                                    Manage <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Activity size={16} className="text-blue-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">WEIGHT TREND</span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <SimpleChart logs={progressLogs.slice(-5)} color="#3b82f6" id="dashboard-weight" />
                            </div>
                            <div className="mt-auto text-right">
                                <button 
                                    onClick={() => navigate('/member/progress')}
                                    className="text-blue-600 text-[11px] font-bold hover:underline tracking-wide"
                                >
                                    Full analysis &rarr;
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Health Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-10">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <HeartPulse size={16} className="text-red-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">HEALTH NOTES</span>
                        </div>
                        <p className="text-slate-600 text-sm font-medium italic mt-2">
                            "{profile?.healthDetails || 'Standard fitness goals. No known allergies.ok'}"
                        </p>
                    </div>
                </div>

                {/* Footer Section */}
                <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center">
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

export default MemberDashboard;

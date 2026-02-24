import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MemberSidebar from '../components/MemberSidebar';
import { Activity, Flame, Heart, Zap, ChevronRight, Trophy, Clock, Calendar, Package, Dumbbell, Utensils, TrendingUp, User } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';

const GYM_HERO = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop";

const MemberDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const [pRes, sRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/member/profile', { headers: { Authorization: auth } }),
                    axios.get('http://localhost:8080/api/member/sessions', { headers: { Authorization: auth } })
                ]);
                setProfile(pRes.data);
                setSessions(sRes.data);
                const localUser = JSON.parse(localStorage.getItem('user'));
                localStorage.setItem('user', JSON.stringify({ ...localUser, membershipStatus: pRes.data.membershipStatus }));
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('auth');
                    navigate('/login');
                }
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

    const todaySessions = sessions.filter(s => isToday(s.sessionTime));

    const calculateBMI = () => {
        if (profile?.height && profile?.weight)
            return (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
        return 'N/A';
    };

    const getBMILabel = () => {
        const b = parseFloat(calculateBMI());
        if (isNaN(b)) return 'N/A';
        if (b < 18.5) return 'Underweight';
        if (b < 25) return 'Healthy';
        if (b < 30) return 'Overweight';
        return 'Obese';
    };

    const quickLinks = [
        { label: 'Workout Plans', icon: Dumbbell, path: '/member/workout-plans', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
        { label: 'Meal Plans', icon: Utensils, path: '/member/meal-plans', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop' },
        { label: 'My Progress', icon: TrendingUp, path: '/member/progress', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop' },
        { label: 'My Profile', icon: User, path: '/member/profile', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop' },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100">
            <MemberSidebar activePage="dashboard" />
            <main className="ml-64 flex-1 flex flex-col">

                {/* Hero Banner with Gym Image */}
                <div className="relative h-64 overflow-hidden shrink-0">
                    <img src={GYM_HERO} alt="Gym" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <MemberHeader title="" />
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
                            <h1 className="text-3xl font-black text-white tracking-tight">{profile?.username || 'Athlete'} 👋</h1>
                            <div className="flex gap-3 mt-4 items-center">
                                <button onClick={() => navigate('/member/workout-plans')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md">
                                    <Dumbbell size={14} /> Start Workout
                                </button>

                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="p-6 space-y-5">

                    {/* Stats Strip — white cards with colored icon circles */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Weight', value: `${profile?.weight || '--'} kg`, icon: Flame, iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
                            { label: 'Height', value: `${profile?.height || '--'} cm`, icon: Activity, iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
                            { label: 'BMI', value: calculateBMI(), sub: getBMILabel(), icon: Heart, iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
                        ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                className="bg-white rounded-xl px-5 py-5 flex items-center gap-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                                    <s.icon size={18} className={s.iconColor} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                                    <p className="font-black text-lg leading-tight text-slate-800">{s.value}</p>
                                    {s.sub && <p className="text-slate-400 text-[10px] font-semibold">{s.sub}</p>}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Access — image cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {quickLinks.map((link, i) => (
                            <motion.button key={i} onClick={() => navigate(link.path)}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                                className="relative h-44 rounded-xl overflow-hidden group text-left border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                                <img src={link.img} alt={link.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                    <link.icon size={22} className="text-white/80" />
                                    <div>
                                        <p className="text-white font-black text-base">{link.label}</p>
                                        <p className="text-white/50 text-xs mt-0.5 group-hover:text-white/80 transition-colors">Open →</p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Membership + Schedule — white cards */}
                    <div className="grid lg:grid-cols-2 gap-4">

                        {/* Membership */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Package size={18} className="text-white/70" />
                                    <div>
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Current Plan</p>
                                        <p className="text-white font-black">{profile?.activePackageName || 'No Active Plan'}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${profile?.membershipStatus === 'ACTIVE' ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-red-400/20 text-red-200 border border-red-400/30'}`}>
                                    {profile?.membershipStatus || 'INACTIVE'}
                                </span>
                            </div>
                            <div className="px-6 py-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-slate-500 text-xs">Rs.{Number(profile?.activePackagePrice || 0).toLocaleString()} &middot; {profile?.activePackageDuration || 0} months</p>

                                </div>
                                <button onClick={() => navigate('/member/membership')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1 transition-all">
                                    Manage <ChevronRight size={12} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Today's Schedule — white card */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4">
                            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Calendar size={12} className="text-blue-500" /> Today's Sessions
                            </h3>
                            {todaySessions.length === 0 ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Clock size={18} />
                                        <p className="text-sm font-medium">No sessions today</p>
                                    </div>
                                    <button onClick={() => navigate('/member/trainer')}
                                        className="text-blue-500 text-xs font-bold hover:text-blue-600 transition-colors">Book now →</button>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {todaySessions.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                            <div>
                                                <p className="text-blue-500 text-xs font-bold">{new Date(item.sessionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-slate-800 text-sm font-bold">{item.sessionType}</p>
                                            </div>
                                            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Health Notes — only shown when available */}
                    {profile?.healthDetails && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4 flex items-start gap-3">
                            <Heart size={16} className="text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Health Notes</p>
                                <p className="text-slate-600 text-sm leading-relaxed italic">"{profile.healthDetails}"</p>
                            </div>
                        </motion.div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default MemberDashboard;

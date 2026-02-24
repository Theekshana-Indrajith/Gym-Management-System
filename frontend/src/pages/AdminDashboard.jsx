import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { Users, ShieldCheck, Activity, DollarSign, TrendingUp, TrendingDown, Target, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import AdminPageBanner from '../components/AdminPageBanner';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalAdmins: 0, totalTrainers: 0, totalMembers: 0, totalRevenue: 0, lowStockAlerts: 0, todayCheckins: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const res = await axios.get('http://localhost:8080/api/admin/stats', {
                    headers: { Authorization: auth }
                });
                setStats(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return "$0.00";
        return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const OverviewCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={32} className="text-white" />
            </div>
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">{title}</h3>
            <p className="text-4xl font-black text-slate-900 mb-4">{value}</p>
            <div className="flex items-center gap-2">
                {trend === 'up' ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-500" />}
                <span className={`font-bold text-sm ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{trendValue} from last month</span>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-slate-100">
            <AdminSidebar activePage="overview" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <AdminPageBanner title="System Overview" subtitle="Global summary of your gym's operations and financial health." icon={LayoutDashboard} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <OverviewCard title="Total Members" value={stats.totalMembers} icon={Users} color="bg-blue-600" trend="up" trendValue="+12%" />
                    <OverviewCard title="Active Trainers" value={stats.totalTrainers} icon={ShieldCheck} color="bg-purple-600" trend="up" trendValue="+2" />
                    <OverviewCard title="Monthly Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-emerald-600" trend="up" trendValue="+8.4%" />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <Activity className="absolute right-[-10%] top-[-10%] text-white/5 w-80 h-80" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-8">Performance Metrics</h3>
                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Daily Check-ins</p>
                                    <div className="flex items-end gap-3">
                                        <p className="text-5xl font-black">{stats.todayCheckins}</p>
                                        <span className="text-emerald-400 font-bold text-sm mb-2">Today</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Stock Alerts</p>
                                    <div className="flex items-end gap-3">
                                        <p className="text-5xl font-black">{stats.lowStockAlerts?.toString().padStart(2, '0') || '00'}</p>
                                        <span className="text-orange-400 font-bold text-sm mb-2">Low Stock</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                        <h3 className="text-2xl font-black text-slate-900 mb-8">Recent Events</h3>
                        <div className="space-y-6">
                            {[
                                { event: "New Member Signup", time: "2 mins ago", icon: "👤" },
                                { event: "Equipment Reported", time: "1 hour ago", icon: "⚠️" },
                                { event: "Stock Replenished", time: "4 hours ago", icon: "📦" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-white transition-all shadow-sm">{item.icon}</div>
                                    <div>
                                        <p className="font-bold text-slate-900">{item.event}</p>
                                        <p className="text-xs text-slate-400">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { Users, ShieldCheck, Activity, DollarSign, TrendingUp, TrendingDown, Target, Box, Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalAdmins: 0, totalTrainers: 0, totalMembers: 0 });
    const [extraStats, setExtraStats] = useState({ equipment: [], supplements: [], inquiries: [], pendingRequests: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const headers = { Authorization: auth };

                const [statsRes, equipRes, suppRes, inqRes, reqRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/admin/stats', { headers }),
                    axios.get('http://localhost:8080/api/admin/equipment', { headers }),
                    axios.get('http://localhost:8080/api/admin/supplements', { headers }),
                    axios.get('http://localhost:8080/api/admin/inquiries', { headers }),
                    axios.get('http://localhost:8080/api/admin/membership/requests/pending', { headers })
                ]);

                setStats(statsRes.data);
                setExtraStats({
                    equipment: equipRes.data,
                    supplements: suppRes.data,
                    inquiries: inqRes.data,
                    pendingRequests: reqRes.data
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const brokenEquipment = extraStats.equipment.filter(e => e.status !== 'WORKING');
    const lowStockSupps = extraStats.supplements.filter(s => s.stock < 10);
    const pendingInquiries = extraStats.inquiries.filter(i => !i.reply);

    // Revenue logic: Count members with active packages (Mocking prices if needed or using backend)
    // For now, let's just use the real aggregate numbers we have.
    const activeInventoryCount = extraStats.equipment.length + extraStats.supplements.length;

    const SimpleChart = ({ data, color, id }) => {
        const width = 500;
        const height = 100;
        const max = Math.max(...data) * 1.1;
        const min = Math.min(...data) * 0.9;
        const range = max - min || 1;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
                <defs>
                    <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M 0,${height} L ${points} L ${width},${height} Z`} fill={`url(#grad-${id})`} />
                <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
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
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <AdminSidebar activePage="overview" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <AdminHeader title="" subtitle="Global summary of your gym's operations and financial health." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">System Overview</h2>
                                <p className="text-slate-300 font-medium">Keep track of gym performance metrics</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <OverviewCard title="Total Members" value={stats.totalMembers} icon={Users} color="bg-blue-600" trend="up" trendValue="+12%" />
                        <OverviewCard title="Active Trainers" value={stats.totalTrainers} icon={ShieldCheck} color="bg-purple-600" trend="up" trendValue="+2" />
                        <OverviewCard title="Pending Review" value={extraStats.pendingRequests.length} icon={ShieldCheck} color="bg-emerald-600" trend="up" trendValue="Action Required" />
                        <OverviewCard title="Gym Assets" value={activeInventoryCount} icon={Box} color="bg-slate-900" trend="up" trendValue="Operational" />
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 flex flex-col justify-between overflow-hidden relative">
                            <div className="relative z-10 flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Operational Overview</h3>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Personnel & Engagement Summary</p>
                                </div>
                                <div className="bg-blue-500/10 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-xs">
                                    <Activity size={16} /> LIVE DATA FEED
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mb-4">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-inner"><Users size={20} /></div>
                                        <h4 className="font-bold text-slate-900">Personnel Mix</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Admins</span>
                                            <span className="font-black text-slate-900">{stats.totalAdmins}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Coaching Staff</span>
                                            <span className="font-black text-slate-900">{stats.totalTrainers}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                                            <div 
                                                className="bg-blue-600 h-full transition-all duration-1000" 
                                                style={{ width: `${(stats.totalAdmins / Math.max(stats.totalAdmins + stats.totalTrainers, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black shadow-inner"><Target size={20} /></div>
                                        <h4 className="font-bold text-slate-900">Engagement</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Open Inquiries</span>
                                            <span className="font-black text-emerald-600">{pendingInquiries.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">New Proposals</span>
                                            <span className="font-black text-slate-900">{extraStats.pendingRequests.length}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                                            <div 
                                                className="bg-emerald-500 h-full transition-all duration-1000" 
                                                style={{ width: `${(pendingInquiries.length / Math.max(pendingInquiries.length + extraStats.pendingRequests.length, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-orange-200 transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black shadow-inner"><Box size={20} /></div>
                                        <h4 className="font-bold text-slate-900">Resource Health</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Asset Issues</span>
                                            <span className="font-black text-red-500">{brokenEquipment.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Low Stock Items</span>
                                            <span className="font-black text-orange-600">{lowStockSupps.length}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                                            <div 
                                                className="bg-orange-500 h-full transition-all duration-1000" 
                                                style={{ width: `${(brokenEquipment.length / Math.max(brokenEquipment.length + lowStockSupps.length, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Broken Gear</p>
                                    <p className="text-lg font-black text-red-500">{brokenEquipment.length} Reports</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Restock Alert</p>
                                    <p className="text-lg font-black text-orange-500">{lowStockSupps.length} Products</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Member Inquiries</p>
                                    <p className="text-lg font-black text-blue-600">{pendingInquiries.length} Open</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Admin Nodes</p>
                                    <p className="text-lg font-black text-slate-900">{stats.totalAdmins} Active</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col h-full">
                            <Activity className="absolute right-[-10%] top-[-10%] text-white/5 w-64 h-64" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <h3 className="text-xl font-bold mb-6">Premium Admin Shortcuts</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/admin/manage-trainers')}
                                        className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Users size={18} /></div>
                                            <span className="text-xs font-black uppercase text-slate-300 group-hover:text-white">Verify Trainers</span>
                                        </div>
                                        <TrendingUp size={14} className="text-blue-500 opacity-0 group-hover:opacity-100" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/membership')}
                                        className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center"><ShieldCheck size={18} /></div>
                                            <span className="text-xs font-black uppercase text-slate-300 group-hover:text-white">Review Members</span>
                                        </div>
                                        <TrendingUp size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/inventory')}
                                        className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center"><Box size={18} /></div>
                                            <span className="text-xs font-black uppercase text-slate-300 group-hover:text-white">Manage Stock</span>
                                        </div>
                                        <TrendingUp size={14} className="text-orange-500 opacity-0 group-hover:opacity-100" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 mt-12">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl overflow-hidden relative">
                            <h3 className="text-2xl font-black text-slate-900 mb-8">Critical Alerts</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {brokenEquipment.length > 0 ? brokenEquipment.map((eq, idx) => (
                                    <div key={idx} className="bg-red-50 p-6 rounded-3xl border border-red-100 flex gap-4">
                                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/20"><Target size={24} /></div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">Equipment Fail: {eq.name}</p>
                                            <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{eq.status} - {eq.location}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-emerald-500 font-bold text-center py-4 bg-emerald-50 rounded-3xl border border-emerald-100">All equipment is working perfectly.</p>
                                )}
                                {lowStockSupps.length > 0 && lowStockSupps.map((supp, idx) => (
                                    <div key={idx} className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20"><Box size={24} /></div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">Low Stock: {supp.name}</p>
                                            <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{supp.stock} units remaining</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex justify-between items-center">
                                Task Stream
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-full"><TrendingUp size={16} /></span>
                            </h3>
                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                                {extraStats.pendingRequests.length > 0 ? extraStats.pendingRequests.map((req, idx) => (
                                    <div key={idx} onClick={() => navigate('/membership-management')} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
                                        <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-all font-black">👤</div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Membership Request: {req.user?.username}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{req.membershipPackage?.name}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-slate-400 italic text-center text-sm py-4">No pending membership requests.</p>
                                )}
                                {pendingInquiries.length > 0 && pendingInquiries.map((inq, idx) => (
                                    <div key={idx} onClick={() => navigate('/feedback-inquiries-admin')} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
                                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-all font-black">💬</div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">New Inquiry: {inq.member?.username}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pending Reply</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
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

export default AdminDashboard;

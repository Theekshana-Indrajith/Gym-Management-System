import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import TrainerHeader from '../components/TrainerHeader';
import AdminSidebar from '../components/AdminSidebar';
import MemberSidebar from '../components/MemberSidebar';
import { MapPin, Tag, Activity, Clock, AlertTriangle, Box, Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';

const EquipmentStatus = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportingAsset, setReportingAsset] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [reportForm, setReportForm] = useState({ issueType: 'Display Won\'t Turn On', urgency: 'Medium', description: '' });
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchEquipment = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const url = user.role === 'ADMIN'
                ? 'http://localhost:8080/api/admin/equipment'
                : 'http://localhost:8080/api/trainer/equipment';

            const res = await axios.get(url, {
                headers: { Authorization: auth }
            });
            setEquipment(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        
        // Validation: Description cannot be only numbers
        if (/^\d+$/.test(reportForm.description.trim())) {
            alert("Please provide a meaningful description of the issue. Numbers only are not allowed.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/trainer/equipment/${reportingAsset.id}/report-issue`, reportForm, {
                headers: { Authorization: auth }
            });
            setReportingAsset(null);
            setReportForm({ issueType: 'Display Won\'t Turn On', urgency: 'Medium', description: '' });
            fetchEquipment();
        } catch (err) {
            alert("Reporting failed");
        }
    };

    const renderSidebar = () => {
        if (user.role === 'ADMIN') return <AdminSidebar activePage="equipment" />;
        if (user.role === 'TRAINER') return <TrainerSidebar activePage="equipment" />;
        return <MemberSidebar activePage="equipment" />;
    };

    if (loading) return null;

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            {renderSidebar()}
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                
                {user.role === 'TRAINER' ? (
                    <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                        <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                            <TrainerHeader title="" subtitle="Monitor the operational state of fitness assets." lightTheme={true} />

                            <div className="mt-8 mb-4 flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Equipment Status</h2>
                                    <p className="text-slate-300 font-medium">Report gym floor hardware breakdowns instantly.</p>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search asset..." 
                                        className="pl-12 pr-6 py-3 rounded-2xl bg-white/10 text-white placeholder-slate-400 border border-white/20 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/50 w-64 font-medium backdrop-blur-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Activity size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <header className="px-10 pt-10 pb-6">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Equipment Status</h1>
                        <p className="text-slate-500 font-medium italic">
                            Monitor the operational state of fitness assets.
                        </p>
                    </header>
                )}

                <div className={`flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full relative z-20 ${user.role === 'TRAINER' ? '-mt-6' : 'mt-4'}`}>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {equipment.filter(eq => 
                        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (eq.location && eq.location.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).map((item) => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl transition-all hover:shadow-2xl hover:border-blue-500/20">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${item.status === 'WORKING' ? 'bg-emerald-50 text-emerald-500' :
                                        item.status === 'BROKEN' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                                    }`}>
                                    <Activity size={24} />
                                </div>
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${item.status === 'WORKING' ? 'bg-emerald-100 text-emerald-600' :
                                        item.status === 'UNDER_MAINTENANCE' ? 'bg-amber-100 text-amber-600' :
                                            'bg-red-100 text-red-600'
                                    }`}>
                                    {item.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">{item.name}</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                    <Tag size={14} className="text-blue-500" /> {item.brand || 'Premium Grade'}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                    <MapPin size={14} className="text-blue-500" /> {item.location || 'Gym Floor'}
                                </div>
                            </div>

                            {user.role === 'TRAINER' && (
                                <div className="flex gap-3 pt-6 border-t border-slate-50">
                                    {item.status === 'WORKING' ? (
                                        <button
                                            onClick={() => setReportingAsset(item)}
                                            className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle size={14} /> Report Issue
                                        </button>
                                    ) : (
                                        <div className="flex-1 bg-slate-50 text-slate-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 border border-dashed border-slate-200">
                                            <Clock size={14} /> Admin Intervention Required
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                </div>

                {reportingAsset && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReportingAsset(null)} 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
                        >
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-2">Report Failure</h3>
                                <p className="text-slate-500 font-medium mb-8">Asset: <span className="text-blue-600 font-black uppercase">{reportingAsset.name}</span></p>
                                
                                <form onSubmit={handleReportSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Type</label>
                                        <select 
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold outline-none"
                                            value={reportForm.issueType}
                                            onChange={e => setReportForm({...reportForm, issueType: e.target.value})}
                                        >
                                            <option>Display Won't Turn On</option>
                                            <option>Belt Slipping/Tight</option>
                                            <option>Strange Noise</option>
                                            <option>Worn Out Parts</option>
                                            <option>Structural Integrity</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Urgency Level</label>
                                        <div className="flex gap-2">
                                            {['Low', 'Medium', 'High'].map(level => (
                                                <button
                                                    key={level} type="button"
                                                    onClick={() => setReportForm({...reportForm, urgency: level})}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        reportForm.urgency === level 
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Description</label>
                                        <textarea 
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold outline-none min-h-[120px]"
                                            placeholder="What happened? (e.g. 'Stopped during use')"
                                            value={reportForm.description}
                                            onChange={e => setReportForm({...reportForm, description: e.target.value})}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="submit" className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-500/20">Submit Report</button>
                                        <button type="button" onClick={() => setReportingAsset(null)} className="px-8 bg-slate-100 text-slate-600 font-black rounded-2xl">Cancel</button>
                                    </div>
                                </form>
                            </div>
                            <AlertTriangle size={150} className="absolute right-[-10%] bottom-[-10%] text-red-50" />
                        </motion.div>
                    </div>
                )}

                {user.role === 'TRAINER' && (
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
                )}
            </main>
        </div>
    );
};

export default EquipmentStatus;

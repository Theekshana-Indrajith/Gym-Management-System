import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ title, subtitle = "Manage MuscleHub operations", lightTheme = false }) => {
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [profile, setProfile] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setProfile(user);
        fetchData();
        
        // Auto-refresh notifications every 30 seconds
        const interval = setInterval(fetchData, 30000);
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearInterval(interval);
        };
    }, []);

    const fetchData = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (!auth) return;

            const res = await axios.get('http://localhost:8080/api/admin/alerts', { headers: { Authorization: auth } });
            setAlerts(res.data);
        } catch (err) {
            console.error("Admin alerts fetch failed", err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'INQUIRY': return <Zap className="text-emerald-600 group-hover:text-white" size={18} />;
            case 'EQUIPMENT': return <Zap className="text-red-600 group-hover:text-white" size={18} />;
            case 'ORDER': return <Zap className="text-orange-600 group-hover:text-white" size={18} />;
            case 'MEMBERSHIP': return <Zap className="text-blue-600 group-hover:text-white" size={18} />;
            default: return <Zap className="text-slate-600 group-hover:text-white" size={18} />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'INQUIRY': return 'bg-emerald-100 group-hover:bg-emerald-500';
            case 'EQUIPMENT': return 'bg-red-100 group-hover:bg-red-500';
            case 'ORDER': return 'bg-orange-100 group-hover:bg-orange-500';
            case 'MEMBERSHIP': return 'bg-blue-100 group-hover:bg-blue-500';
            default: return 'bg-slate-100 group-hover:bg-slate-500';
        }
    };

    const unreadCount = alerts.length;

    const handleAlertClick = (link) => {
        setShowNotifications(false);
        navigate(link);
    };

    return (
        <header className="flex justify-between items-center mb-6 relative z-40">
            <div>
                {title && <h1 className={`text-3xl font-bold tracking-tight mb-1 ${lightTheme ? 'text-white' : 'text-slate-900'}`}>{title}</h1>}
                {subtitle && <p className={`text-sm ${lightTheme ? 'text-slate-300' : 'text-slate-500'}`}>{subtitle}</p>}
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-3 rounded-xl transition-all relative ${showNotifications ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white text-slate-600 shadow-sm border border-slate-100 hover:border-blue-200'}`}
                    >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                    <h3 className="font-black text-slate-900">Admin Alerts</h3>
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                        {unreadCount} Actions Required
                                    </span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                                    {alerts.length === 0 ? (
                                        <div className="py-10 text-center text-slate-400 font-medium italic">
                                            System is fully optimal. No pending actions.
                                        </div>
                                    ) : (
                                        alerts.map((a, i) => (
                                            <div
                                                key={i}
                                                onClick={() => handleAlertClick(a.link)}
                                                className={`flex gap-4 p-4 rounded-2xl transition-colors border border-transparent cursor-pointer group bg-blue-50/50 hover:border-blue-100`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${getIconBg(a.type)}`}>
                                                    {getIcon(a.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className={`font-bold text-sm leading-tight mb-1 text-slate-900`}>{a.title}</p>
                                                        <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1 animate-pulse" />
                                                    </div>
                                                    <p className={`text-xs line-clamp-2 leading-relaxed font-medium text-slate-600`}>{a.message}</p>
                                                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-2 block group-hover:text-blue-600 transition-colors">
                                                        Click to Manage →
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Profile Summary */}
                <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
                        {profile?.username?.[0]?.toUpperCase() || <User size={18} />}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{profile?.username || 'Loading...'}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">ADMIN</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;

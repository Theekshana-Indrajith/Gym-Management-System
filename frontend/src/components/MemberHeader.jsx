import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MemberHeader = ({ title, subtitle = "Have a productive workout today!", lightTheme = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [profile, setProfile] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (!auth) return;

            const [pRes, nRes] = await Promise.all([
                axios.get('http://localhost:8080/api/member/profile', { headers: { Authorization: auth } }),
                axios.get('http://localhost:8080/api/notifications/my', { headers: { Authorization: auth } })
            ]);
            setProfile(pRes.data);
            setNotifications(nRes.data);
        } catch (err) {
            console.error("Header fetch failed", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleReadAll = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.put('http://localhost:8080/api/notifications/read-all', {}, { headers: { Authorization: auth } });
            fetchData();
        } catch (err) {
            console.error("Mark all as read failed", err);
        }
    };

    const handleReadOne = async (id) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.put(`http://localhost:8080/api/notifications/${id}/read`, {}, { headers: { Authorization: auth } });
            fetchData();
        } catch (err) {
            console.error("Mark as read failed", err);
        }
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
                        className={`p-3 rounded-xl transition-all relative ${showNotifications ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white text-slate-600 shadow-sm border border-slate-100 hover:border-blue-200'
                            }`}
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
                                    <h3 className="font-black text-slate-900">Notifications</h3>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                        {unreadCount} New
                                    </span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                                    {notifications.length === 0 ? (
                                        <div className="py-10 text-center text-slate-400 font-medium italic">
                                            No new notifications
                                        </div>
                                    ) : (
                                        notifications.map((n, i) => (
                                            <div
                                                key={i}
                                                onClick={() => !n.read && handleReadOne(n.id)}
                                                className={`flex gap-4 p-4 rounded-2xl transition-colors border border-transparent cursor-pointer group ${n.read ? 'bg-slate-50 opacity-60' : 'bg-blue-50/50 hover:border-blue-100'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${n.read ? 'bg-slate-200' : 'bg-blue-100 group-hover:bg-blue-500'
                                                    }`}>
                                                    <Zap size={18} className={n.read ? 'text-slate-400' : 'text-blue-600 group-hover:text-white'} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className={`font-bold text-sm leading-tight mb-1 ${n.read ? 'text-slate-500' : 'text-slate-900'}`}>{n.title}</p>
                                                        {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />}
                                                    </div>
                                                    <p className={`text-xs line-clamp-2 leading-relaxed font-medium ${n.read ? 'text-slate-400' : 'text-slate-600'}`}>{n.message}</p>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 block">
                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            onClick={handleReadAll}
                                            className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-widest"
                                        >
                                            Mark All as Read
                                        </button>
                                    </div>
                                )}
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
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Member Plan</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default MemberHeader;

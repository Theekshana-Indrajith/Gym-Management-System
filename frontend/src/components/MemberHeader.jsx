import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, Settings, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MemberHeader = ({ title, subtitle = "Have a productive workout today!", lightTheme = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
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
                                                onClick={() => {
                                                    setSelectedNotification(n);
                                                    if (!n.read) handleReadOne(n.id);
                                                    setShowNotifications(false);
                                                }}
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
                <AnimatePresence>
                    {selectedNotification && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 relative shadow-2xl border border-white/20"
                            >
                                <button 
                                    onClick={() => setSelectedNotification(null)} 
                                    className="absolute right-10 top-10 text-slate-400 hover:text-slate-900 transition-colors p-3 bg-slate-50 rounded-full hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={24} />
                                </button>
                                
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40">
                                        <Zap size={40} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 leading-tight">Advisory Detail</h2>
                                        <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.2em] mt-2">Personal Training Insight</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                                        <h3 className="text-xl font-black text-slate-900 mb-4 leading-snug">{selectedNotification.title}</h3>
                                        <p className="text-slate-600 font-bold text-base leading-[1.8] whitespace-pre-wrap italic">
                                            "{selectedNotification.message}"
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dispatched On</span>
                                            <span className="text-sm font-black text-slate-900">{new Date(selectedNotification.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</span>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedNotification(null)} 
                                            className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                        >
                                            Dismiss Signal
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
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

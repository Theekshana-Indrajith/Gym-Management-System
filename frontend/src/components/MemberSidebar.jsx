import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, User, BrainCircuit, Calendar,
    ShoppingBag, LineChart, Gift, HelpCircle, LogOut, Activity,
    Dumbbell, Utensils, CreditCard
} from 'lucide-react';
import axios from 'axios';

const MemberSidebar = ({ activePage }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (!auth) return;
            const res = await axios.get('http://localhost:8080/api/notifications/my', { headers: { Authorization: auth } });
            setNotifications(res.data.filter(n => !n.read)); // Only count unread
        } catch (err) {
            console.error("Sidebar notification fetch failed", err);
        }
    };

    const getBadgeCount = (menuId) => {
        let count = 0;
        notifications.forEach(n => {
            if (menuId === 'store' && (n.type === 'INQUIRY_REPLY' || n.type === 'ORDER_UPDATE')) count++;
            if (menuId === 'trainer' && n.type === 'PROGRESS_ADVISORY') count++;
        });
        return count;
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth');
        navigate('/login');
    };
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/member-dashboard' },
        { id: 'profile', label: 'My Profile', icon: User, path: '/member/profile' },
        { id: 'trainer', label: 'Trainer Sessions', icon: Calendar, path: '/member/trainer' },
        { id: 'store', label: 'Supplement Store', icon: ShoppingBag, path: '/member/store' },
        { id: 'progress', label: 'My Progress', icon: LineChart, path: '/member/progress' },
        { id: 'workout-plans', label: 'Workout Plans', icon: Dumbbell, path: '/member/workout-plans' },
        { id: 'meal-plans', label: 'Meal Plans', icon: Utensils, path: '/member/meal-plans' },
        { id: 'membership', label: 'Membership Hub', icon: CreditCard, path: '/member/membership' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-50">
            <Link to="/member-dashboard" className="p-6 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                <div className="p-2 bg-blue-500 rounded-lg">
                    <Activity size={20} className="text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter">MUSCLE<span className="text-blue-500">HUB</span></span>
            </Link>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const count = getBadgeCount(item.id);
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-medium ${activePage === item.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                {item.label}
                            </div>
                            {count > 0 && (
                                <span className={`flex items-center justify-center w-5 h-5 text-[10px] font-black rounded-full ${activePage === item.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'}`}>
                                    {count > 99 ? '99+' : count}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-4">
                {localStorage.getItem('user') && (
                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Membership</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300">
                                {JSON.parse(localStorage.getItem('user')).membershipStatus || 'NONE'}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${JSON.parse(localStorage.getItem('user')).membershipStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                                }`}></div>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 rounded-xl transition-all duration-300 font-bold"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default MemberSidebar;

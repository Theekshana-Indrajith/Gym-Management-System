import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Dumbbell, Wrench,
    Store, MessageSquare, Gift, LogOut, ShieldCheck, Utensils, CreditCard
} from 'lucide-react';
import axios from 'axios';

const AdminSidebar = ({ activePage }) => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (!auth) return;
            const res = await axios.get('http://localhost:8080/api/admin/alerts', { headers: { Authorization: auth } });
            setAlerts(res.data);
        } catch (err) {
            console.error("Sidebar alerts fetch failed", err);
        }
    };

    const getAlertCount = (menuId) => {
        let count = 0;
        alerts.forEach(a => {
            if (menuId === 'inventory' && a.type === 'ORDER') count += a.count;
            if (menuId === 'equipment' && a.type === 'EQUIPMENT') count += a.count;
            if (menuId === 'membership' && a.type === 'MEMBERSHIP') count += a.count;
            if (menuId === 'feedback' && a.type === 'INQUIRY') count += a.count;
        });
        return count;
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth');
        navigate('/login');
    };
    const menuItems = [
        { id: 'overview', label: 'System Overview', icon: LayoutDashboard, path: '/admin-dashboard' },
        { id: 'users', label: 'User Management', icon: Users, path: '/admin/manage-users' },
        { id: 'trainers', label: 'Trainer Hub', icon: Dumbbell, path: '/admin/manage-trainers' },
        { id: 'equipment', label: 'Equipment & Maintenance', icon: Wrench, path: '/admin/equipment' },
        { id: 'inventory', label: 'Inventory & Store', icon: Store, path: '/admin/inventory' },
        { id: 'membership', label: 'Membership Plan', icon: CreditCard, path: '/admin/membership' },
        { id: 'workout-plans', label: 'Workout Plans', icon: Dumbbell, path: '/admin/workout-plans' },
        { id: 'meal-plans', label: 'Meal & Nutrition', icon: Utensils, path: '/admin/meal-plans' },
        { id: 'feedback', label: 'Feedback & Support', icon: MessageSquare, path: '/admin/feedback' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-50">
            <Link to="/admin-dashboard" className="p-6 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                <div className="p-2 bg-blue-600 rounded-lg">
                    <ShieldCheck size={20} className="text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">MuscleHub<span className="text-blue-500">Admin</span></span>
            </Link>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const count = getAlertCount(item.id);
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
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
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

export default AdminSidebar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Dumbbell,
    ClipboardList, MessageSquare, LogOut, Activity, Utensils
} from 'lucide-react';

const TrainerSidebar = ({ activePage }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth');
        navigate('/login');
    };
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/trainer-dashboard' },
        { id: 'schedule', label: 'My Schedule', icon: ClipboardList, path: '/trainer/schedule' },
        { id: 'members', label: 'My Members', icon: Users, path: '/trainer/members' },
        { id: 'equipment', label: 'Equipment & Maintenance', icon: Dumbbell, path: '/trainer/equipment-status' },

        { id: 'workout-plans', label: 'Workout Plans', icon: Dumbbell, path: '/trainer/workout-plans' },
        { id: 'meal-plans', label: 'Meal Plans', icon: Utensils, path: '/trainer/meal-plans' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-50">
            <Link to="/trainer-dashboard" className="p-6 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                <div className="p-2 bg-emerald-500 rounded-lg">
                    <Activity size={20} className="text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">Trainer<span className="text-emerald-500">Hub</span></span>
            </Link>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${activePage === item.id
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </Link>
                ))}
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

export default TrainerSidebar;

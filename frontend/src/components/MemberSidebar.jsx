import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, User, BrainCircuit, Calendar,
    ShoppingBag, LineChart, Gift, HelpCircle, LogOut, Activity,
    Dumbbell, Utensils, CreditCard
} from 'lucide-react';

const MemberSidebar = ({ activePage }) => {
    const navigate = useNavigate();

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

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${activePage === item.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </Link>
                ))}
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

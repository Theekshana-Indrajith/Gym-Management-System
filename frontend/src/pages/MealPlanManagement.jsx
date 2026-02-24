import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import MemberSidebar from '../components/MemberSidebar';
import TrainerSidebar from '../components/TrainerSidebar';
import { Utensils, BrainCircuit, Plus, Sparkles, Trash2, Calendar, Soup, ChevronRight, Apple, Pill, Coffee, Sun, Moon, Candy } from 'lucide-react';
import axios from 'axios';

const MealPlanManagement = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            setUser(storedUser);

            if (storedUser.role === 'MEMBER') {
                try {
                    const auth = JSON.parse(localStorage.getItem('auth'));
                    const res = await axios.get('http://localhost:8080/api/member/profile', {
                        headers: { Authorization: auth }
                    });
                    if (res.data.membershipStatus !== 'ACTIVE') {
                        navigate('/member/membership');
                        return;
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            if (storedUser && storedUser.id) {
                fetchPlans(storedUser);
            }
        };
        checkAccess();
    }, [navigate]);

    const fetchPlans = async (currentUser) => {
        if (!currentUser || !currentUser.id) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const url = currentUser.role === 'MEMBER'
                ? `http://localhost:8080/api/meal-plans/member/${currentUser.id}`
                : `http://localhost:8080/api/meal-plans`;

            const res = await axios.get(url, {
                headers: { Authorization: auth }
            });
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const renderSidebar = () => {
        if (user?.role === 'ADMIN') return <AdminSidebar activePage="meal-plans" />;
        if (user?.role === 'TRAINER') return <TrainerSidebar activePage="meal-plans" />;
        return <MemberSidebar activePage="meal-plans" />;
    };

    return (
        <div className="flex min-h-screen bg-[#0f172a]">
            {user && renderSidebar()}

            <main className="ml-64 flex-1 p-10">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tight">Meal & Nutrition <span className="text-emerald-500">Plan</span></h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {plans.length > 0 ? (
                        plans.map((plan, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={plan.id}
                                className="bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${plan.isAiGenerated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {plan.isAiGenerated ? <BrainCircuit size={24} /> : <Apple size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{plan.planName}</h3>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    {plan.isAiGenerated ? 'AI Macros Optimized' : 'Standard Nutrition'}
                                                </span>
                                                {(user.role === 'TRAINER' || user.role === 'ADMIN') && plan.member && (
                                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                                        Member: {plan.member.username}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
                                        <div key={meal} className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                {meal === 'breakfast' && <Coffee size={14} className="text-emerald-400" />}
                                                {meal === 'lunch' && <Sun size={14} className="text-yellow-400" />}
                                                {meal === 'dinner' && <Moon size={14} className="text-blue-400" />}
                                                {meal === 'snacks' && <Candy size={14} className="text-pink-400" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{meal}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm">{plan[meal] || 'No specific menu items'}</p>
                                        </div>
                                    ))}
                                </div>


                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar size={14} />
                                        <span className="text-xs font-bold">{plan.createdDate}</span>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-white font-bold text-[10px] uppercase tracking-widest">
                                        {plan.dailyCalories || '0'} kcal/day
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-bold text-[10px] uppercase tracking-widest">
                                        {plan.dietType || 'Balanced'}
                                    </div>
                                    {plan.trainer && (
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            Coach: {plan.trainer.username}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="lg:col-span-2 py-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-[3rem]">
                            <Apple size={48} className="mb-4 opacity-20" />
                            <p className="font-bold text-lg">No active meal plans found.</p>
                            <p className="text-sm">Please consult your coach for a nutrition plan.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MealPlanManagement;

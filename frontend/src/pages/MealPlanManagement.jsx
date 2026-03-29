import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import MemberSidebar from '../components/MemberSidebar';
import TrainerSidebar from '../components/TrainerSidebar';
import { Utensils, BrainCircuit, Plus, Sparkles, Trash2, Calendar, Target, X, CheckCircle, Apple, ChevronRight, Flame, ShoppingBag, Box, Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';
import AdminHeader from '../components/AdminHeader';
import TrainerHeader from '../components/TrainerHeader';

const MealPlanManagement = () => {
    const [plans, setPlans] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [supplements, setSupplements] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [selectedFoods, setSelectedFoods] = useState([]); // Array of { foodId, grams, name, cals }
    const [selectedMember, setSelectedMember] = useState('ALL');
    const [newPlan, setNewPlan] = useState({
        planName: '', meals: '', dietType: 'BALANCED', goal: '', dailyCalories: 0, memberId: '', supplementId: '', supplementDosage: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            setUser(storedUser);

            if (storedUser.role === 'MEMBER') {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const res = await axios.get('http://localhost:8080/api/member/profile', {
                    headers: { Authorization: auth }
                });
                if (res.data.membershipStatus !== 'ACTIVE') {
                    navigate('/member/membership');
                    return;
                }
            } else if (storedUser.role === 'TRAINER') {
                fetchMembers();
                fetchSupplements();
                fetchFoodItems();
            }
            fetchPlans(storedUser);
        };
        checkAccess();
    }, [navigate, selectedMember]);

    const fetchMembers = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/trainer/my-members', {
                headers: { Authorization: auth }
            });
            setMembers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSupplements = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/supplements', {
                headers: { Authorization: auth }
            });
            setSupplements(res.data);
        } catch (err) {
            console.error("Fetch supplements failed:", err);
        }
    };

    const fetchFoodItems = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/food-items', {
                headers: { Authorization: auth }
            });
            setFoodItems(res.data);
        } catch (err) {
            console.error("Fetch foods failed:", err);
        }
    };

    const fetchPlans = async (currentUser) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            let url;
            if (currentUser.role === 'MEMBER') {
                url = `http://localhost:8080/api/meal-plans/member/${currentUser.id}`;
            } else if (currentUser.role === 'TRAINER') {
                url = selectedMember === 'ALL'
                    ? `http://localhost:8080/api/meal-plans/trainer/${currentUser.id}`
                    : `http://localhost:8080/api/meal-plans/member/${selectedMember}`;
            } else {
                url = `http://localhost:8080/api/meal-plans`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: auth }
            });
            setPlans(res.data);
        } catch (err) {
            console.error("Fetch plans failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();

        // Validation: Plan Name cannot be only numbers
        if (/^\d+$/.test(newPlan.planName.trim())) {
            alert("Plan Name cannot be only numbers. Please provide a descriptive title (e.g. 'Mass Gainer Phase 1').");
            return;
        }

        // Validation: Meals description
        if (/^\d+$/.test(newPlan.meals.trim())) {
            alert("Meal description/sequence cannot be only numbers.");
            return;
        }

        if (!newPlan.meals.trim()) {
            alert("Please add at least one food item or describe the meals.");
            return;
        }

        // Validation: Calories
        if (newPlan.dailyCalories <= 0) {
            alert("Daily Calories must be greater than zero.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/meal-plans', {
                ...newPlan,
                member: { id: newPlan.memberId },
                recommendedSupplement: newPlan.supplementId ? { id: newPlan.supplementId } : null
            }, {
                headers: { Authorization: auth }
            });
            setShowCreateModal(false);
            setNewPlan({ planName: '', meals: '', dietType: 'BALANCED', goal: '', dailyCalories: 2000, memberId: '', supplementId: '', supplementDosage: '' });
            fetchPlans(user);
        } catch (err) {
            alert("Creation failed");
        }
    };

    const triggerAI = async (memberId) => {
        setIsGenerating(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/meal-plans/ai-generate', memberId, {
                headers: {
                    Authorization: auth,
                    'Content-Type': 'application/json'
                }
            });
            fetchPlans(user);
            alert("AI Nutrition Strategy Generated!");
        } catch (err) {
            alert("AI Trigger Failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const deactivatePlan = async (id) => {
        if (!window.confirm("Are you sure you want to stop this plan? It will be moved to the history section.")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/meal-plans/${id}/deactivate`, {}, {
                headers: { Authorization: auth }
            });
            fetchPlans(user);
        } catch (err) {
            alert("Deactivation failed.");
        }
    };

    const deletePlan = async (id) => {
        if (!window.confirm("Permanently delete this plan record from the system?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/meal-plans/${id}`, {
                headers: { Authorization: auth }
            });
            setPlans(plans.filter(p => p.id !== id));
        } catch (err) {
            alert("Delete failed.");
        }
    };

    const renderSidebar = () => {
        if (user?.role === 'ADMIN') return <AdminSidebar activePage="meal-plans" />;
        if (user?.role === 'TRAINER') return <TrainerSidebar activePage="meal-plans" />;
        return <MemberSidebar activePage="meal-plans" />;
    };

    const isMember = user?.role === 'MEMBER';
    const isAdmin = user?.role === 'ADMIN';
    const isTrainer = user?.role === 'TRAINER';
    const isPremium = isMember || isAdmin || isTrainer;

    return (
        <div className={`flex min-h-screen ${isPremium ? 'bg-blue-100 font-sans' : 'bg-[#0f172a]'}`}>
            {user && renderSidebar()}

            <main className={`ml-64 flex-1 flex flex-col min-h-screen`}>
                {isPremium ? (
                    <div className="relative bg-slate-900 px-8 pt-8 pb-14 overflow-hidden shadow-sm">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                        <div className="relative z-10 max-w-[1400px] mx-auto w-full">
                            {isMember ? (
                                <MemberHeader title="Meal Plans" subtitle="View and track your dietary requirements" lightTheme={true} />
                            ) : isTrainer ? (
                                <TrainerHeader title="Meal Plans" subtitle="Strategic nutritional design and athlete oversight." lightTheme={true} />
                            ) : (
                                <AdminHeader title="Meal Plans" subtitle="Monitor and manage all system dietary routines." lightTheme={true} />
                            )}

                            {isTrainer && (
                                <div className="mt-8 flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Dietary Regimes</h2>
                                        <p className="text-slate-300 font-medium italic">Building personalized caloric sequences for your athletes.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Member</label>
                                            <select
                                                value={selectedMember}
                                                onChange={(e) => setSelectedMember(e.target.value)}
                                                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none min-w-[200px] font-bold text-sm"
                                            >
                                                <option value="ALL" className="bg-slate-900">All Members</option>
                                                {members.map(m => (
                                                    <option key={m.id} value={m.id} className="bg-slate-900">@{m.username}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all transform active:scale-95"
                                        >
                                            <Plus size={20} /> Create Manual Diet
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="px-10 pt-10">
                        <header className="mb-12 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <Utensils size={20} />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Nutrition Control Center</span>
                                </div>
                                <h1 className="text-5xl font-black text-white tracking-tight">Dietary <span className="text-emerald-500">Regimes</span></h1>
                            </div>

                            {user?.role === 'TRAINER' && (
                                <div className="flex gap-4">
                                    <div className="relative group">
                                        <select
                                            value={selectedMember}
                                            onChange={(e) => setSelectedMember(e.target.value)}
                                            className="bg-slate-800/50 border border-white/10 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-emerald-500 appearance-none min-w-[200px] font-bold text-sm"
                                        >
                                            <option value="ALL">All Members</option>
                                            {members.map(m => (
                                                <option key={m.id} value={m.id}>@{m.username}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95"
                                    >
                                        <Plus size={20} /> Create Manual Diet
                                    </button>
                                </div>
                            )}
                        </header>
                    </div>
                )}

                <div className={`flex-1 ${isPremium ? 'px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20' : 'p-10 pt-6'}`}>
                    <div className="space-y-12">
                        {isMember && plans.some(p => p.isActive) && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-px flex-1 bg-emerald-500/20"></div>
                                    <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.3em]">Your Active Regimen</h2>
                                    <div className="h-px flex-1 bg-emerald-500/20"></div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {plans.filter(p => p.isActive).map((plan, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={plan.id}
                                            className={isPremium ? "bg-white rounded-2xl shadow-xl border-l-[6px] border-emerald-500 p-8 hover:shadow-2xl transition-all group relative overflow-hidden" : "bg-slate-800/50 backdrop-blur-xl border-l-[6px] border-emerald-500 rounded-[2.5rem] p-8 transition-all group relative overflow-hidden"}
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400">
                                                        {plan.isAiGenerated ? <BrainCircuit size={24} /> : <Apple size={24} />}
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-xl font-bold mb-1 ${isPremium ? 'text-slate-900' : 'text-white'}`}>{plan.planName}</h3>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Current Protocol</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`${isPremium ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-slate-900/50 border-white/5 text-slate-400'} rounded-2xl p-6 mb-6 border overflow-y-auto max-h-48`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-line font-medium text-slate-700">{plan.meals}</p>
                                            </div>

                                            {plan.supplementName && (
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between group/supp">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                                            <ShoppingBag size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Recommended Supplement</p>
                                                            <p className="text-sm font-bold text-slate-600">
                                                                {plan.supplementName}
                                                                {plan.supplementDosage && <span className="text-emerald-500 font-medium ml-2 text-xs">({plan.supplementDosage})</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isMember && (
                                                        <button
                                                            onClick={() => navigate('/member/store')}
                                                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all opacity-0 group-hover/supp:opacity-100"
                                                        >
                                                            Buy in Store
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                        <Calendar size={14} />
                                                        <span>{plan.createdDate}</span>
                                                    </div>
                                                    <div className="px-3 py-1 bg-orange-500/10 text-orange-400 font-bold text-[10px] uppercase tracking-widest rounded-lg">
                                                        {plan.dailyCalories} kcal
                                                    </div>
                                                    <div className="px-3 py-1 bg-blue-500/10 text-blue-500 font-bold text-[10px] uppercase tracking-widest rounded-lg">
                                                        {plan.dietType}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            {isMember && plans.some(p => !p.isActive) && (
                                <div className="flex items-center gap-4 mb-8 mt-12">
                                    <div className="h-px flex-1 bg-slate-500/20"></div>
                                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Plan History</h2>
                                    <div className="h-px flex-1 bg-slate-500/20"></div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {(isMember ? plans.filter(p => !p.isActive) : plans).map((plan, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={plan.id}
                                        className={isPremium ? "bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-all group relative overflow-hidden" : "bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden"}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-4 rounded-2xl ${plan.isAiGenerated ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-blue-500/20 text-blue-400 font-bold'}`}>
                                                    {plan.isAiGenerated ? <BrainCircuit size={24} /> : <Apple size={24} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className={`text-xl font-bold ${isPremium ? 'text-slate-900' : 'text-white'}`}>{plan.planName}</h3>
                                                        {!isMember && (
                                                            plan.isActive ? (
                                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase rounded-full border border-emerald-500/30">Active</span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 bg-slate-500/20 text-slate-500 text-[9px] font-black uppercase rounded-full border border-slate-500/30">Archived</span>
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                            {plan.isAiGenerated ? 'Neural Nutrition' : 'Structured Diet'}
                                                        </span>
                                                        {!isMember && (
                                                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                                                                @{plan.memberUsername}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {user?.role === 'TRAINER' && plan.isActive && (
                                                <button 
                                                    onClick={() => deactivatePlan(plan.id)} 
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                                >
                                                    <X size={14} /> Stop Plan
                                                </button>
                                            )}
                                        </div>

                                        <div className={`${isPremium ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-slate-900/50 border-white/5 text-slate-400'} rounded-2xl p-6 mb-6 border scrollbar-hide overflow-y-auto max-h-48 text-sm`}>
                                            <p className="whitespace-pre-line font-medium">{plan.meals}</p>
                                        </div>


                                        {plan.supplementName && (
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between group/supp">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                                        <ShoppingBag size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Recommended Supplement</p>
                                                        <p className="text-sm font-bold text-white">
                                                            {plan.supplementName}
                                                            {plan.supplementDosage && <span className="text-emerald-400 font-medium ml-2 text-xs">({plan.supplementDosage})</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isMember && (
                                                    <button
                                                        onClick={() => navigate('/member/store')}
                                                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all opacity-0 group-hover/supp:opacity-100"
                                                    >
                                                        Buy in Store
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                    <Calendar size={14} />
                                                    <span>{plan.createdDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-orange-400 text-xs font-bold">
                                                    <Flame size={14} />
                                                    <span>{plan.dailyCalories} kcal</span>
                                                </div>
                                                <div className="px-3 py-1 bg-white/5 rounded-lg text-white font-bold text-[10px] uppercase tracking-widest border border-white/5">
                                                    {plan.dietType}
                                                </div>
                                            </div>
                                            {user?.role === 'MEMBER' && (
                                                <button className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase hover:text-emerald-300">
                                                    Track Intake <ChevronRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {plans.length === 0 && (
                                    <div className="lg:col-span-2 py-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-[3rem]">
                                        <Utensils size={48} className="mb-4 opacity-20 text-emerald-500" />
                                        <p className={`font-black text-lg ${isPremium ? 'text-slate-800' : 'text-white'}`}>No dietary plans found.</p>
                                        <p className="text-sm font-medium italic">
                                            {user?.role === 'MEMBER' ? 'Wait for your trainer to construct a plan.' : 'Initiate diet sequence generation for your members.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                </div>

                {/* Trainer Only: AI Generation Quick Select
                {user?.role === 'TRAINER' && (
                    <div className="mt-12 bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                                <Sparkles className="text-yellow-400" /> Bio-Nutritional Optimization
                            </h2>
                            <p className="text-emerald-100 font-bold mb-8">Select an athlete to calculate AI-based nutritional requirements.</p>

                            <div className="flex flex-wrap gap-4">
                                {members.map(member => (
                                    <button
                                        key={member.id}
                                        onClick={() => triggerAI(member.id)}
                                        disabled={isGenerating}
                                        className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl font-black text-sm border border-white/20 hover:bg-white/20 transition-all flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-[10px]">
                                            {member.username.charAt(0).toUpperCase()}
                                        </div>
                                        Generate for {member.username}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <BrainCircuit className="absolute right-[-5%] bottom-[-10%] w-64 h-64 text-white/10" />
                    </div>
                )} */}

                {/* Manual Plan Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-800 w-full max-w-[1000px] rounded-[3rem] p-10 relative shadow-2xl border border-white/10"
                            >
                                <button onClick={() => setShowCreateModal(false)} className="absolute right-8 top-8 text-slate-500 hover:text-white">
                                    <X size={24} />
                                </button>
                                <h2 className="text-3xl font-black mb-1 text-white">Smart Nutrition Entry</h2>
                                <p className="text-slate-500 font-medium mb-8 uppercase text-[10px] tracking-widest">Building personalized caloric sequences</p>

                                <form onSubmit={handleCreatePlan} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* LEFT SIDE: Selection & Builder */}
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase text-slate-500">Target Athlete</label>
                                                    <select
                                                        className="w-full bg-slate-900/50 p-4 rounded-2xl border border-white/5 font-bold text-white outline-none focus:border-emerald-500 text-sm"
                                                        value={newPlan.memberId}
                                                        onChange={e => {
                                                            setNewPlan({ ...newPlan, memberId: e.target.value });
                                                            setSelectedFoods([]);
                                                        }}
                                                        required
                                                    >
                                                        <option value="">Select Athlete</option>
                                                        {members.map(m => (
                                                            <option key={m.id} value={m.id}>
                                                                @{m.username} ({m.dietaryPreference})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase text-slate-500">Dietary Goal</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Bulk"
                                                        className="w-full bg-slate-900/50 p-4 rounded-2xl border border-white/5 font-bold text-white outline-none focus:border-emerald-500 text-sm"
                                                        value={newPlan.goal}
                                                        onChange={e => setNewPlan({ ...newPlan, goal: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Health & Allergies Alert */}
                                            {newPlan.memberId && members.find(m => m.id == newPlan.memberId) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-4"
                                                >
                                                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 shrink-0">
                                                        <Target size={20} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[10px] font-black uppercase text-red-400 tracking-widest">Crucial: Health & Allergy Alert</h4>
                                                        <p className="text-[11px] font-bold text-white/80 leading-relaxed">
                                                            {members.find(m => m.id == newPlan.memberId).allergies ? (
                                                                <>Allergies: <span className="text-red-400">{members.find(m => m.id == newPlan.memberId).allergies}</span></>
                                                            ) : "No documented allergies."}
                                                            <br />
                                                            {members.find(m => m.id == newPlan.memberId).healthDetails && (
                                                                <span className="opacity-60 italic">— Profile Details: {members.find(m => m.id == newPlan.memberId).healthDetails}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
                                                <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 flex items-center gap-2">
                                                    <Utensils size={14} /> Add Items to Sequence
                                                </h4>
                                                <div className="flex gap-2 mb-4">
                                                    <select
                                                        id="foodItemSelector"
                                                        className="flex-1 bg-slate-900 p-3 rounded-xl border border-white/5 text-white text-xs font-bold font-sans outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="">Select Food...</option>
                                                        {foodItems.filter(fi => {
                                                            const member = members.find(m => m.id == newPlan.memberId);
                                                            if (!member) return true;
                                                            if (member.dietaryPreference === 'VEGETARIAN' && fi.category === 'NON_VEG') return false;
                                                            if (member.dietaryPreference === 'VEGAN' && (fi.category === 'NON_VEG' || fi.category === 'VEGETARIAN')) return false;
                                                            if (member.excludedMeatTypes && fi.subType && member.excludedMeatTypes.toUpperCase().includes(fi.subType.toUpperCase())) return false;
                                                            return true;
                                                        }).map(fi => (
                                                            <option key={fi.id} value={JSON.stringify(fi)}>
                                                                {fi.name} ({fi.caloriesPer100g} cal/100g)
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        id="foodWeight"
                                                        defaultValue={100}
                                                        className="w-20 bg-slate-900 p-3 rounded-xl border border-white/5 text-white text-xs font-bold outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const s = document.getElementById('foodItemSelector');
                                                            const w = document.getElementById('foodWeight');
                                                            if (!s.value) return;
                                                            const food = JSON.parse(s.value);
                                                            const grams = parseFloat(w.value);
                                                            const cals = (food.caloriesPer100g / 100) * grams;
                                                            const newList = [...selectedFoods, { name: food.name, grams, cals }];
                                                            setSelectedFoods(newList);

                                                            const totalCals = newList.reduce((acc, f) => acc + f.cals, 0);
                                                            const mealText = newList.map(f => `${f.name}: ${f.grams}g`).join('\n');
                                                            setNewPlan(prev => ({ ...prev, dailyCalories: Math.round(totalCals), meals: mealText }));
                                                        }}
                                                        className="bg-emerald-600 p-3 rounded-xl text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/10"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>

                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                    {selectedFoods.map((f, i) => (
                                                        <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 group">
                                                            <div className="text-[11px] font-bold text-white">
                                                                {f.name} <span className="text-slate-500 font-medium ml-2">{f.grams}g ({Math.round(f.cals)} kcal)</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = selectedFoods.filter((_, idx) => idx !== i);
                                                                    setSelectedFoods(updated);
                                                                    const totalCals = updated.reduce((acc, f) => acc + f.cals, 0);
                                                                    const mealText = updated.map(f => `${f.name}: ${f.grams}g`).join('\n');
                                                                    setNewPlan(prev => ({ ...prev, dailyCalories: Math.round(totalCals), meals: mealText }));
                                                                }}
                                                                className="text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT SIDE: Preview & Supplement */}
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs font-black uppercase text-slate-500">Regimen Preview</label>
                                                    <div className="flex items-center gap-1 text-emerald-400 font-black text-xs">
                                                        <Flame size={12} /> {newPlan.dailyCalories} kcal
                                                    </div>
                                                </div>
                                                <textarea
                                                    className="w-full bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 font-bold text-white outline-none focus:border-emerald-500 h-40 text-sm"
                                                    placeholder="Sequence preview..."
                                                    value={newPlan.meals}
                                                    onChange={e => setNewPlan({ ...newPlan, meals: e.target.value })}
                                                    required
                                                ></textarea>
                                            </div>

                                            <div className="bg-blue-900/20 p-6 rounded-[2rem] border border-blue-500/10 space-y-4">
                                                <h4 className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2">
                                                    <ShoppingBag size={14} /> Store Recommendation
                                                </h4>
                                                <select
                                                    className="w-full bg-slate-900 p-4 rounded-2xl border border-white/5 font-bold text-white outline-none focus:border-blue-500 text-xs"
                                                    value={newPlan.supplementId}
                                                    onChange={e => setNewPlan({ ...newPlan, supplementId: e.target.value })}
                                                >
                                                    <option value="">None / No Supplement</option>
                                                    {supplements.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.name} - LKR {s.price}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-500 px-1">Protocol Identifier (Plan Name)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. High Protein Bulk #1"
                                            className="w-full bg-slate-900/50 p-5 rounded-[2rem] border border-white/5 font-bold text-white outline-none focus:border-emerald-500"
                                            value={newPlan.planName}
                                            onChange={e => setNewPlan({ ...newPlan, planName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <button className="w-full bg-emerald-600 text-white py-5 rounded-[2.5rem] font-black text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-95">
                                        <CheckCircle size={24} /> Finalize & Deploy Strategy
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

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

export default MealPlanManagement;

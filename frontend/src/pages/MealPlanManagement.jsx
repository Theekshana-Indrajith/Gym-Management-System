import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import MemberSidebar from '../components/MemberSidebar';
import TrainerSidebar from '../components/TrainerSidebar';
import { Utensils, BrainCircuit, Plus, Sparkles, Trash2, Calendar, Target, X, CheckCircle, Apple, ChevronRight, Flame, ShoppingBag, Box, Facebook, Twitter, Instagram, User, Filter, Zap } from 'lucide-react';
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
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [selectedMember, setSelectedMember] = useState('ALL');
    const [newPlan, setNewPlan] = useState({
        planName: '', meals: '', dietType: 'BALANCED', goal: '', dailyCalories: 0, memberId: '', supplementId: '', supplementDosage: ''
    });

    const [showAIPreview, setShowAIPreview] = useState(false);
    const [selectedAImember, setSelectedAIMember] = useState(null);
    const [activeTab, setActiveTab] = useState('AI_HUB');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [pendingPlan, setPendingPlan] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            setUser(storedUser);

            if (storedUser.role === 'TRAINER') {
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
        } catch (err) { console.error(err); }
    };

    const fetchSupplements = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/supplements', {
                headers: { Authorization: auth }
            });
            setSupplements(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchFoodItems = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/food-items', {
                headers: { Authorization: auth }
            });
            setFoodItems(res.data);
        } catch (err) { console.error(err); }
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

            const res = await axios.get(url, { headers: { Authorization: auth } });
            setPlans(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();

        if (!newPlan.meals || newPlan.meals.trim().length === 0) {
            alert("Nutritional Error: A dietary regime cannot be empty. Please include meals.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/meal-plans', {
                ...newPlan,
                member: { id: newPlan.memberId },
                recommendedSupplement: newPlan.supplementId ? { id: newPlan.supplementId } : null
            }, { headers: { Authorization: auth } });
            setShowCreateModal(false);
            setNewPlan({ planName: '', meals: '', dietType: 'BALANCED', goal: '', dailyCalories: 2000, memberId: '', supplementId: '', supplementDosage: '' });
            fetchPlans(user);
        } catch (err) { alert("Creation failed"); }
    };

    const handleAIRequest = (member) => {
        setSelectedAIMember(member);
        setShowAIPreview(true);
    };

    const triggerAI = async () => {
        if (!selectedAImember) return;
        setIsGenerating(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.post(`http://localhost:8080/api/meal-plans/ai-generate/${selectedAImember.id}`, selectedAImember, {
                headers: { Authorization: auth }
            });
            setShowAIPreview(false);
            setPendingPlan(res.data);
            setShowReviewModal(true);
            fetchPlans(user);
        } catch (err) { alert("AI Trigger Failed"); }
        finally { setIsGenerating(false); }
    };

    const confirmAIPlan = async (id) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/meal-plans/${id}/confirm`, pendingPlan, {
                headers: { Authorization: auth }
            });
            setShowReviewModal(false);
            setPendingPlan(null);
            fetchPlans(user);
            alert("AI Diet Strategy Published!");
        } catch (err) { alert("Confirmation Failed"); }
    };

    const deactivatePlan = async (id) => {
        if (!window.confirm("Stop this plan?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/meal-plans/${id}/deactivate`, {}, {
                headers: { Authorization: auth }
            });
            fetchPlans(user);
        } catch (err) { alert("Deactivation failed."); }
    };

    const renderSidebar = () => {
        if (user?.role === 'ADMIN') return <AdminSidebar activePage="meal-plans" />;
        if (user?.role === 'TRAINER') return <TrainerSidebar activePage="meal-plans" />;
        return <MemberSidebar activePage="meal-plans" />;
    };

    const isMember = user?.role === 'MEMBER';
    const isTrainer = user?.role === 'TRAINER';
    const isPremium = true;

    return (
        <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200">
            {user && renderSidebar()}

            <main className="ml-64 flex-1 flex flex-col min-h-screen relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 px-10 pt-10">
                    <header className="flex justify-between items-center mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                <Zap size={18} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Control Center</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Dietary <span className="text-emerald-500">Intelligence</span></h1>
                        </div>

                        {isTrainer && (
                            <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-2xl">
                                <button
                                    onClick={() => setActiveTab('AI_HUB')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'AI_HUB' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Sparkles size={14} /> AI Hub
                                </button>
                                <button
                                    onClick={() => setActiveTab('MANAGEMENT')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MANAGEMENT' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Utensils size={14} /> Management
                                </button>
                            </div>
                        )}
                    </header>

                    <div className="min-h-[70vh]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'AI_HUB' && isTrainer ? (
                                <motion.div
                                    key="ai-hub"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="relative z-10 max-w-2xl">
                                            <h2 className="text-4xl font-black mb-4 leading-tight">Get Personalized Meals <br /></h2>
                                            <p className="text-emerald-100 font-medium text-lg mb-8 opacity-90">Select an athlete below to initiate a Bio-Nutritional analysis and generate a 100% personalized dietary regimen.</p>
                                        </div>
                                        <div className="absolute right-[-5%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
                                            <BrainCircuit size={400} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {members.map(member => (
                                            <motion.button
                                                whileHover={{ scale: 1.02, y: -5 }}
                                                key={member.id}
                                                onClick={() => handleAIRequest(member)}
                                                className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 hover:border-emerald-500/50 transition-all text-left flex flex-col justify-between min-h-[180px] group shadow-xl"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xl">
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">{member.fitnessGoal || 'No Goal'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-lg mb-1">@{member.username}</p>
                                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                                                        Analyze Bio-Data <ChevronRight size={12} />
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="management"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Sub-Header for Management */}
                                    <div className="flex justify-between items-end mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <select
                                                    value={selectedMember}
                                                    onChange={e => setSelectedMember(e.target.value)}
                                                    className="bg-white/5 border border-white/10 pl-12 pr-10 py-3 rounded-2xl text-sm font-bold appearance-none focus:outline-none focus:border-emerald-500 text-white min-w-[220px]"
                                                >
                                                    <option value="ALL" className="bg-slate-900">All Athletes</option>
                                                    {members.map(m => <option key={m.id} value={m.id} className="bg-slate-900">@{m.username}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {isTrainer && (
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95"
                                            >
                                                <Plus size={18} strokeWidth={3} /> Create Manual Diet
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {plans.length > 0 ? plans.map((plan, idx) => (
                                            <div key={plan.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden shadow-2xl">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${plan.isAiGenerated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                            {plan.isAiGenerated ? <BrainCircuit size={28} /> : <Apple size={28} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h3 className="text-xl font-black text-white">{plan.planName}</h3>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{plan.isAiGenerated ? 'Neural Generated' : 'Manual Protocol'}</span>
                                                                {!isMember && (
                                                                    <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded uppercase tracking-tighter">@{plan.memberUsername}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isTrainer && plan.isActive && (
                                                        <button onClick={() => deactivatePlan(plan.id)} className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                                    )}
                                                </div>

                                                <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                                                    <p className="text-sm text-slate-300 font-medium leading-relaxed whitespace-pre-line">{plan.meals}</p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest"><Calendar size={14} /> {plan.createdDate}</div>
                                                        <div className="flex items-center gap-2 text-orange-400 text-[10px] font-black uppercase tracking-widest"><Flame size={14} /> {plan.dailyCalories} kcal</div>
                                                    </div>
                                                    {isTrainer && plan.isReviewPending && (
                                                        <button onClick={() => { setPendingPlan(plan); setShowReviewModal(true); }} className="bg-amber-500/20 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all">Review Draft</button>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-50">
                                                <Utensils size={48} className="text-slate-700 mb-4" />
                                                <p className="font-black text-slate-500">No Dietary Protocols Found.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Modals are unchanged in logic but kept for functionality */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 w-full max-w-[900px] rounded-[3rem] p-12 relative shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]">
                                <button onClick={() => setShowCreateModal(false)} className="absolute right-8 top-8 text-slate-500 hover:text-white"><X size={28} /></button>
                                <h2 className="text-4xl font-black mb-10 text-white">Manual <span className="text-emerald-500">Entry</span></h2>
                                <form onSubmit={handleCreatePlan} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <select className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold outline-none focus:border-emerald-500" value={newPlan.memberId} onChange={e => setNewPlan({ ...newPlan, memberId: e.target.value })} required>
                                                <option value="" className="bg-slate-900">Select Athlete</option>
                                                {members.map(m => <option key={m.id} value={m.id} className="bg-slate-900">@{m.username}</option>)}
                                            </select>
                                            <input type="text" placeholder="Dietary Goal" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold outline-none focus:border-emerald-500" value={newPlan.goal} onChange={e => setNewPlan({ ...newPlan, goal: e.target.value })} />
                                            <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 space-y-4">
                                                <div className="flex gap-2">
                                                    <select id="foodItemSelector" className="flex-1 bg-white/5 p-3 rounded-xl text-white text-xs outline-none border border-white/10">
                                                        <option value="" className="bg-slate-900">Select Food...</option>
                                                        {foodItems.map(f => <option key={f.id} value={JSON.stringify(f)} className="bg-slate-900">{f.name}</option>)}
                                                    </select>
                                                    <input type="number" id="foodWeight" defaultValue={100} className="w-20 bg-white/5 p-3 rounded-xl text-white text-xs outline-none border border-white/10" />
                                                    <button type="button" onClick={() => {
                                                        const s = document.getElementById('foodItemSelector');
                                                        const w = document.getElementById('foodWeight');
                                                        if (!s.value) return;
                                                        const food = JSON.parse(s.value);
                                                        const newList = [...selectedFoods, { name: food.name, grams: w.value, cals: (food.caloriesPer100g / 100) * w.value }];
                                                        setSelectedFoods(newList);
                                                        const totalCals = newList.reduce((a, b) => a + b.cals, 0);
                                                        const text = newList.map(f => `${f.name}: ${f.grams}g`).join('\n');
                                                        setNewPlan({ ...newPlan, dailyCalories: Math.round(totalCals), meals: text });
                                                    }} className="bg-emerald-600 p-3 rounded-xl text-white"><Plus size={18} /></button>
                                                </div>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                    {selectedFoods.map((f, i) => (
                                                        <div key={i} className="flex justify-between bg-white/5 p-3 rounded-xl border border-white/5 text-[10px] font-bold">
                                                            <span>{f.name} ({f.grams}g)</span>
                                                            <button type="button" onClick={() => {
                                                                const updated = selectedFoods.filter((_, idx) => idx !== i);
                                                                setSelectedFoods(updated);
                                                                const totalCals = updated.reduce((a, b) => a + b.cals, 0);
                                                                const text = updated.map(f => `${f.name}: ${f.grams}g`).join('\n');
                                                                setNewPlan({ ...newPlan, dailyCalories: Math.round(totalCals), meals: text });
                                                            }} className="text-red-400"><X size={12} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <textarea className="w-full bg-white/5 p-6 rounded-[2rem] border border-white/10 text-white font-medium h-48 outline-none focus:border-emerald-500 text-sm" placeholder="Plan Sequence Preview..." value={newPlan.meals} onChange={e => setNewPlan({ ...newPlan, meals: e.target.value })} required />
                                            <select className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold outline-none" value={newPlan.supplementId} onChange={e => setNewPlan({ ...newPlan, supplementId: e.target.value })}>
                                                <option value="" className="bg-slate-900">Recommended Supplement</option>
                                                {supplements.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <input type="text" placeholder="Plan Name" className="w-full bg-white/5 p-5 rounded-3xl border border-white/10 text-white font-black text-lg outline-none focus:border-emerald-500" value={newPlan.planName} onChange={e => setNewPlan({ ...newPlan, planName: e.target.value })} required />
                                    <button className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-xl shadow-2xl hover:bg-emerald-500 transition-all active:scale-95">Deploy Strategy</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* AI Analysis Modal */}
                <AnimatePresence>
                    {showAIPreview && selectedAImember && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400"><User size={32} /></div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Bio-Analysis</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">@{selectedAImember.username}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Age</label>
                                        <input type="number" className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5" value={selectedAImember.age || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, age: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Gender</label>
                                        <input className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5" value={selectedAImember.gender || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, gender: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Weight (kg)</label>
                                        <input type="number" className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5" value={selectedAImember.weight || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, weight: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Height (cm)</label>
                                        <input type="number" className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5" value={selectedAImember.height || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, height: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Fitness Goal</label>
                                        <select className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5 outline-none" value={selectedAImember.fitnessGoal || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, fitnessGoal: e.target.value })}>
                                            <option value="Weight Loss" className="bg-slate-900">Weight Loss</option>
                                            <option value="Weight Gain" className="bg-slate-900">Weight Gain</option>
                                            <option value="Muscle Hypertrophy" className="bg-slate-900">Muscle Hypertrophy</option>
                                            <option value="Endurance" className="bg-slate-900">Endurance</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Allergies / Dietary Restrictions</label>
                                        <textarea className="w-full bg-white/5 p-3 rounded-xl text-white font-medium border border-white/5 h-24 text-sm outline-none focus:border-emerald-500 transition-all custom-scrollbar shrink-0" value={selectedAImember.allergies || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, allergies: e.target.value })} placeholder="None / List allergies..."></textarea>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Health & Medical Details</label>
                                        <textarea className="w-full bg-white/5 p-3 rounded-xl text-white font-medium border border-white/5 h-24 text-sm outline-none focus:border-emerald-500 transition-all custom-scrollbar shrink-0" value={selectedAImember.healthDetails || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, healthDetails: e.target.value })} placeholder="Medical conditions, injuries etc..."></textarea>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowAIPreview(false)} className="flex-1 py-4 border border-white/10 rounded-2xl font-black text-slate-500">Cancel</button>
                                    <button onClick={triggerAI} disabled={isGenerating} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                        {isGenerating ? 'Analyzing...' : <><Sparkles size={16} /> Start Generation</>}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Review Modal */}
                <AnimatePresence>
                    {showReviewModal && pendingPlan && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 w-full max-w-2xl rounded-[3rem] p-12 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
                                <h3 className="text-3xl font-black text-white mb-8 flex items-center gap-4"><BrainCircuit className="text-emerald-500" size={32} /> Quality Assurance</h3>
                                <div className="space-y-6 mb-10">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Neural Strategy Name</label>
                                        <input className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-black text-lg" value={pendingPlan.planName} onChange={e => setPendingPlan({ ...pendingPlan, planName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Sequence Correction</label>
                                        <textarea className="w-full bg-white/5 p-6 rounded-[2rem] border border-white/10 text-white font-medium min-h-[250px] text-sm" value={pendingPlan.meals} onChange={e => setPendingPlan({ ...pendingPlan, meals: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowReviewModal(false)} className="flex-1 py-4 border border-white/10 rounded-2xl font-black text-slate-500">Save Partial</button>
                                    <button onClick={() => confirmAIPlan(pendingPlan.id)} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20">Approve & Deploy</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MealPlanManagement;

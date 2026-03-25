import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import MemberSidebar from '../components/MemberSidebar';
import TrainerSidebar from '../components/TrainerSidebar';
import { Dumbbell, BrainCircuit, Plus, Sparkles, Trash2, Calendar, Target, X, CheckCircle, Users, ChevronRight, Box, Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';
import AdminHeader from '../components/AdminHeader';
import TrainerHeader from '../components/TrainerHeader';

const WorkoutPlanManagement = () => {
    const [plans, setPlans] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [equipmentList, setEquipmentList] = useState([]);
    const [newPlan, setNewPlan] = useState({
        planName: '', 
        exercises: [{ name: '', equipmentId: '', setsReps: '' }], // Changed to structured array
        difficulty: 'BEGINNER', 
        goal: '', 
        memberId: ''
    });
    const [selectedMember, setSelectedMember] = useState('ALL');

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
                if (storedUser.role === 'TRAINER') {
                    fetchMembers();
                    fetchEquipment(); // Fetch equipment for dropdown
                }
            } else if (storedUser.role === 'TRAINER') {
                fetchMembers();
                fetchEquipment();
            }
            fetchPlans(storedUser);
        };
        checkAccess();
    }, [navigate, selectedMember]);

    const fetchEquipment = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/trainer/equipment', {
                headers: { Authorization: auth }
            });
            setEquipmentList(res.data);
        } catch (err) {
            console.error("Equipment fetch failed", err);
        }
    };

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

    const fetchPlans = async (currentUser) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            let url;
            if (currentUser.role === 'MEMBER') {
                url = `http://localhost:8080/api/workout-plans/member/${currentUser.id}`;
            } else if (currentUser.role === 'TRAINER') {
                url = selectedMember === 'ALL' 
                    ? `http://localhost:8080/api/workout-plans/trainer/${currentUser.id}`
                    : `http://localhost:8080/api/workout-plans/member/${selectedMember}`;
            } else {
                url = `http://localhost:8080/api/workout-plans`;
            }

            const res = await axios.get(url, { headers: { Authorization: auth } });
            const plansData = res.data;

            // Fetch consistency for each plan
            const plansWithPerformance = await Promise.all(plansData.map(async (plan) => {
                try {
                    const perfUrl = currentUser.role === 'MEMBER'
                        ? `http://localhost:8080/api/workout-plans/weekly-summary?planId=${plan.id}`
                        : `http://localhost:8080/api/workout-plans/member/${plan.memberId}/performance?planId=${plan.id}`;
                    
                    const perfRes = await axios.get(perfUrl, { headers: { Authorization: auth } });
                    return { ...plan, performance: perfRes.data };
                } catch (e) {
                    return { ...plan, performance: { consistencyPercentage: 0, averageCompletion: 0 } };
                }
            }));

            setPlans(plansWithPerformance);
        } catch (err) {
            console.error("Fetch plans failed:", err);
            const serverMsg = err.response?.data || err.message;
            alert("Fetch Plans Failed: " + serverMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();

        // Validation: Plan Name cannot be only numbers
        if (/^\d+$/.test(newPlan.planName.trim())) {
            alert("Plan Name cannot be only numbers. Please provide a descriptive title (e.g. 'Strength Phase 01').");
            return;
        }

        // Validation: Exercises
        for (let i = 0; i < newPlan.exercises.length; i++) {
            const ex = newPlan.exercises[i];
            if (/^\d+$/.test(ex.name.trim())) {
                alert(`Exercise #${i + 1} name cannot be only numbers.`);
                return;
            }
            if (!ex.setsReps.trim()) {
                alert(`Exercise #${i + 1} requires Sets/Reps information.`);
                return;
            }
        }

        // Filter out empty exercises and format equipment
        const formattedExercises = newPlan.exercises.filter(ex => ex.name.trim() !== '').map(ex => {
            const equipment = equipmentList.find(e => e.id.toString() === ex.equipmentId.toString());
            return {
                name: ex.name,
                equipmentId: ex.equipmentId,
                equipmentName: equipment ? equipment.name : 'No Equipment',
                setsReps: ex.setsReps
            };
        });

        if (formattedExercises.length === 0) {
            alert("Please add at least one exercise to the plan.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/workout-plans', {
                ...newPlan,
                exercises: JSON.stringify(formattedExercises), // Save as JSON string
                member: { id: newPlan.memberId }
            }, {
                headers: { Authorization: auth }
            });
            setShowCreateModal(false);
            setNewPlan({ 
                planName: '', 
                exercises: [{ name: '', equipmentId: '', setsReps: '' }], 
                difficulty: 'BEGINNER', 
                goal: '', 
                memberId: '' 
            });
            fetchPlans(user);
        } catch (err) {
            console.error(err);
            alert("Creation failed: " + (err.response?.data || err.message));
        }
    };

    const addExerciseRow = () => {
        setNewPlan(prev => ({
            ...prev,
            exercises: [...prev.exercises, { name: '', equipmentId: '', setsReps: '' }]
        }));
    };

    const removeExerciseRow = (index) => {
        setNewPlan(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index)
        }));
    };

    const updateExercise = (index, field, value) => {
        setNewPlan(prev => {
            const updated = [...prev.exercises];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, exercises: updated };
        });
    };

    const triggerAI = async (memberId) => {
        setIsGenerating(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/workout-plans/ai-generate', memberId, {
                headers: {
                    Authorization: auth,
                    'Content-Type': 'application/json'
                }
            });
            fetchPlans(user);
            alert("AI Workout Strategy Generated!");
        } catch (err) {
            alert("AI Trigger Failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const deletePlan = async (id) => {
        if (!window.confirm("Delete this plan?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/workout-plans/${id}`, {
                headers: { Authorization: auth }
            });
            setPlans(plans.filter(p => p.id !== id));
        } catch (err) {
            alert("Delete failed. Only trainers can delete plans.");
        }
    };

    const renderSidebar = () => {
        if (user?.role === 'ADMIN') return <AdminSidebar activePage="workout-plans" />;
        if (user?.role === 'TRAINER') return <TrainerSidebar activePage="workout-plans" />;
        return <MemberSidebar activePage="workout-plans" />;
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
                                <MemberHeader title="Workout Plans" subtitle="View and track your training routines" lightTheme={true} />
                            ) : isTrainer ? (
                                <TrainerHeader title="Workout Plans" subtitle="Strategic routine design and athlete oversight." lightTheme={true} />
                            ) : (
                                <AdminHeader title="Workout Plans" subtitle="Monitor and manage all system workout routines." lightTheme={true} />
                            )}

                            {!isMember && (
                                <div className="mt-8 flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Technical Regimes</h2>
                                        <p className="text-slate-300 font-medium italic">Constructing direct training sequences for your athletes.</p>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Member</label>
                                            <select
                                                className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl border border-white/20 font-bold outline-none focus:border-blue-500 min-w-[200px]"
                                                value={selectedMember}
                                                onChange={(e) => setSelectedMember(e.target.value)}
                                            >
                                                <option value="ALL">All Assigned</option>
                                                {members.map(m => <option key={m.id} value={m.id} className="bg-slate-900">{m.username}</option>)}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all transform active:scale-95"
                                        >
                                            <Plus size={20} /> Create Manual Plan
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
                                <div className="flex items-center gap-2 mb-2 text-blue-400">
                                    <Dumbbell size={20} />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Workout Control Center</span>
                                </div>
                                <h1 className="text-5xl font-black text-white tracking-tight">Active Workout <span className="text-blue-500">Regimes</span></h1>
                            </div>

                            {user?.role === 'TRAINER' && (
                                <div className="flex gap-4 items-center">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Filter by Member</label>
                                        <select
                                            className="bg-slate-800 text-white px-6 py-3 rounded-xl border border-white/5 font-bold outline-none focus:border-blue-500 min-w-[200px]"
                                            value={selectedMember}
                                            onChange={(e) => {
                                                setSelectedMember(e.target.value);
                                                // Trigger refetch will happen via useEffect if we add dependency, or manually
                                            }}
                                        >
                                            <option value="ALL">All My Assigns</option>
                                            {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-blue-500 hover:text-white transition-all transform active:scale-95"
                                    >
                                        <Plus size={20} /> Create Manual Plan
                                    </button>
                                </div>
                            )}
                        </header>
                    </div>
                )}

                <div className={`flex-1 ${isPremium ? 'px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20' : 'p-10 pt-6'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {plans.length > 0 ? (
                            plans.map((plan, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={plan.id}
                                    className={isPremium ? "bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-all group relative overflow-hidden" : "bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden"}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-4 rounded-2xl ${plan.isAiGenerated ? 'bg-blue-500/20 text-blue-400 font-bold' : 'bg-emerald-500/20 text-emerald-400 font-bold'}`}>
                                                {plan.isAiGenerated ? <BrainCircuit size={24} /> : <Target size={24} />}
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-bold mb-1 ${isPremium ? 'text-slate-900' : 'text-white'}`}>{plan.planName}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        {plan.isAiGenerated ? 'Neural Prediction' : 'Technical Routine'}
                                                    </span>
                                                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                                                        @{plan.memberUsername}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${plan.status === 'CURRENT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-500 border border-slate-500/30'}`}>
                                                        {plan.status === 'CURRENT' ? 'Active Protocol' : 'Archived'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {user?.role !== 'MEMBER' && (
                                            <button onClick={() => deletePlan(plan.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className={`${isPremium ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-slate-900/50 border-white/5 text-slate-400'} rounded-2xl p-6 mb-6 border scrollbar-hide overflow-y-auto max-h-48`}>
                                        <div className="space-y-3">
                                            {(() => {
                                                try {
                                                    const exs = JSON.parse(plan.exercises);
                                                    if (Array.isArray(exs)) {
                                                        return exs.map((ex, i) => (
                                                            <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                                                                <div className="flex flex-col">
                                                                    <span className={`font-black tracking-tight ${isPremium ? 'text-slate-900' : 'text-white'}`}>{ex.name}</span>
                                                                    <span className="text-[10px] uppercase font-bold text-blue-400">{ex.equipmentName || 'No Equipment'}</span>
                                                                </div>
                                                                <span className="text-xs font-black text-slate-500">{ex.setsReps}</span>
                                                            </div>
                                                        ));
                                                    }
                                                } catch (e) {
                                                    return <p className={`${isPremium ? 'text-slate-600' : 'text-slate-400'} text-sm leading-relaxed whitespace-pre-line mb-4`}>{plan.exercises}</p>;
                                                }
                                                return <p className={`${isPremium ? 'text-slate-600' : 'text-slate-400'} text-sm leading-relaxed whitespace-pre-line mb-4`}>{plan.exercises}</p>;
                                            })()}
                                        </div>
                                        
                                        <div className="pt-4 border-t border-white/10 space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-400">
                                                <span>Protocol Consistency</span>
                                                <span>{plan.performance?.consistencyPercentage?.toFixed(0) || 0}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${plan.performance?.consistencyPercentage || 0}%` }}
                                                    className="h-full bg-blue-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                <Calendar size={14} />
                                                <span>{plan.createdDate}</span>
                                            </div>
                                            <div className="px-3 py-1 bg-white/5 rounded-lg text-white font-bold text-[10px] uppercase tracking-widest border border-white/5">
                                                {plan.difficulty}
                                            </div>
                                        </div>
                                        {user?.role === 'MEMBER' && (
                                            <button className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase hover:text-blue-300">
                                                Log Progress <ChevronRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="lg:col-span-2 py-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-[3rem]">
                                <Dumbbell size={48} className="mb-4 opacity-20 text-blue-500" />
                                <p className={`font-black text-lg ${isPremium ? 'text-slate-800' : 'text-white'}`}>No active workout plans found.</p>
                                <p className="text-sm font-medium italic">
                                    {user?.role === 'MEMBER' ? 'Wait for your trainer to assign or generate a plan.' : 'Start by generating or creating a plan for your members.'}
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Trainer Only: AI Generation Quick Select */}
                {user?.role === 'TRAINER' && (
                    <div className="mt-12 bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                                <Sparkles className="text-yellow-400" /> Neural Optimization Hub
                            </h2>
                            <p className="text-blue-100 font-bold mb-8">Select an athlete to trigger AI-based workout sequence generation.</p>

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
                )}

                {/* Manual Plan Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-800 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl border border-white/10"
                            >
                                <button onClick={() => setShowCreateModal(false)} className="absolute right-8 top-8 text-slate-500 hover:text-white">
                                    <X size={24} />
                                </button>
                                <h2 className="text-3xl font-black mb-1 text-white">Technical Manual Entry</h2>
                                <p className="text-slate-500 font-medium mb-8 uppercase text-[10px] tracking-widest">Constructing direct training sequence</p>

                                <form onSubmit={handleCreatePlan} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500">Target Member</label>
                                            <select
                                                className="w-full bg-slate-900/50 p-4 rounded-2xl border border-white/5 font-bold text-white outline-none focus:border-blue-500"
                                                value={newPlan.memberId}
                                                onChange={e => setNewPlan({ ...newPlan, memberId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Athlete</option>
                                                {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500">Difficulty Matrix</label>
                                            <select
                                                className="w-full bg-slate-900/50 p-4 rounded-2xl border border-white/5 font-bold text-white outline-none focus:border-blue-500"
                                                value={newPlan.difficulty}
                                                onChange={e => setNewPlan({ ...newPlan, difficulty: e.target.value })}
                                            >
                                                <option value="BEGINNER">Beginner</option>
                                                <option value="INTERMEDIATE">Intermediate</option>
                                                <option value="ADVANCED">Advanced</option>
                                                <option value="PRO">Elite</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-500">Plan Designation (Name)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Hypertrophy Peak Phase"
                                            className="w-full bg-slate-900/50 p-4 rounded-2xl border border-white/5 font-bold text-white outline-none focus:border-blue-500"
                                            value={newPlan.planName}
                                            onChange={e => setNewPlan({ ...newPlan, planName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-black uppercase text-slate-500">Exercise Sequence</label>
                                            <button 
                                                type="button"
                                                onClick={addExerciseRow}
                                                className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <Plus size={12} /> Add Exercise
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                            {newPlan.exercises.map((ex, index) => (
                                                <div key={index} className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-4 relative group">
                                                    {newPlan.exercises.length > 1 && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeExerciseRow(index)}
                                                            className="absolute right-4 top-4 text-slate-600 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Exercise Name</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Chest Press"
                                                                className="w-full bg-slate-800 p-3 rounded-xl border border-white/5 text-sm text-white outline-none focus:border-blue-500"
                                                                value={ex.name}
                                                                onChange={e => updateExercise(index, 'name', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Sets / Reps</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. 3 x 12"
                                                                className="w-full bg-slate-800 p-3 rounded-xl border border-white/5 text-sm text-white outline-none focus:border-blue-500"
                                                                value={ex.setsReps}
                                                                onChange={e => updateExercise(index, 'setsReps', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Equipment Selection</label>
                                                        <select
                                                            className="w-full bg-slate-800 p-3 rounded-xl border border-white/5 text-sm text-white outline-none focus:border-blue-500"
                                                            value={ex.equipmentId}
                                                            onChange={e => updateExercise(index, 'equipmentId', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">No Equipment (Bodyweight)</option>
                                                            {equipmentList.map(item => (
                                                                <option key={item.id} value={item.id}>
                                                                    {item.name} ({item.brand})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3">
                                        <CheckCircle size={24} /> Deploy Plan to Athlete
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

export default WorkoutPlanManagement;

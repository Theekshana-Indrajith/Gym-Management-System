import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import MemberSidebar from '../components/MemberSidebar';
import TrainerSidebar from '../components/TrainerSidebar';
import { Dumbbell, BrainCircuit, Plus, Sparkles, Trash2, Calendar, Target, X, CheckCircle, Activity, ChevronRight, Box, Facebook, Twitter, Instagram, Zap, Filter, User } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';
import AdminHeader from '../components/AdminHeader';
import TrainerHeader from '../components/TrainerHeader';

const EXERCISE_LIBRARY = {
    'Chest': ['Bench Press', 'Incline Press', 'Dumbbell Fly', 'Push Ups', 'Cable Crossover'],
    'Back': ['Pull-ups', 'Lat Pulldown', 'Bent Over Row', 'Deadlift', 'Face Pulls'],
    'Legs': ['Squats', 'Leg Press', 'Lunges', 'Leg Extension', 'Hamstring Curls'],
    'Shoulders': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Shrugs'],
    'Arms': ['Bicep Curls', 'Hammer Curls', 'Tricep Extension', 'Skull Crushers', 'Dips'],
    'Core': ['Crunches', 'Plank', 'Leg Raise', 'Russian Twist'],
    'Cardio': ['Running', 'Cycling', 'Burpees', 'Jump Rope']
};

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
        exercises: [{ name: '', equipmentId: '', sets: '3', reps: '12', isManual: false, tempName: '' }],
        difficulty: 'BEGINNER',
        goal: '',
        memberId: ''
    });
    const [selectedMember, setSelectedMember] = useState('ALL');
    const [showAIPreview, setShowAIPreview] = useState(false);
    const [selectedAImember, setSelectedAIMember] = useState(null);
<<<<<<< Updated upstream
    const [activeTab, setActiveTab] = useState('AI_HUB'); 
=======
    const [activeTab, setActiveTab] = useState('AI_HUB');
>>>>>>> Stashed changes
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [pendingPlan, setPendingPlan] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            setUser(storedUser);
            if (storedUser.role === 'TRAINER') {
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
        } catch (err) { console.error(err); }
    };

    const fetchMembers = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/trainer/my-members', {
                headers: { Authorization: auth }
            });
            setMembers(res.data);
        } catch (err) { console.error(err); }
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

            const plansWithPerformance = await Promise.all(plansData.map(async (plan) => {
                try {
                    const perfUrl = currentUser.role === 'MEMBER'
                        ? `http://localhost:8080/api/workout-plans/weekly-summary?planId=${plan.id}`
                        : `http://localhost:8080/api/workout-plans/member/${plan.memberId}/performance?planId=${plan.id}`;
                    const perfRes = await axios.get(perfUrl, { headers: { Authorization: auth } });
                    return { ...plan, performance: perfRes.data };
                } catch (e) {
                    return { ...plan, performance: { consistencyPercentage: 0 } };
                }
            }));
            setPlans(plansWithPerformance);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
<<<<<<< Updated upstream
=======

        // Validation: Check if exercises are provided
        const validExercises = newPlan.exercises.filter(ex => (ex.isManual ? ex.tempName : ex.name).trim() !== '');
        
        if (validExercises.length === 0) {
            alert("Protocol Violation: You must include at least one valid exercise in the sequence.");
            return;
        }

>>>>>>> Stashed changes
        const formattedExercises = newPlan.exercises.map(ex => {
            const equipment = equipmentList.find(eq => eq.id.toString() === ex.equipmentId.toString());
            return {
                name: ex.isManual ? ex.tempName : ex.name,
                equipmentId: ex.equipmentId,
                equipmentName: equipment ? equipment.name : 'No Equipment',
                setsReps: `${ex.sets} x ${ex.reps}`
            };
        });

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/workout-plans', {
                ...newPlan,
                exercises: JSON.stringify(formattedExercises),
                member: { id: newPlan.memberId }
            }, { headers: { Authorization: auth } });
            setShowCreateModal(false);
            setNewPlan({
                planName: '',
                exercises: [{ name: '', equipmentId: '', sets: '3', reps: '12', isManual: false, tempName: '' }],
                difficulty: 'BEGINNER', goal: '', memberId: ''
            });
            fetchPlans(user);
        } catch (err) { alert("Creation failed"); }
    };

    const addExerciseRow = () => {
        setNewPlan(prev => ({
            ...prev,
            exercises: [...prev.exercises, { name: '', equipmentId: '', sets: '3', reps: '12', isManual: false, tempName: '' }]
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

    const handleAIRequest = (member) => {
        setSelectedAIMember(member);
        setShowAIPreview(true);
    };

    const triggerAI = async () => {
        if (!selectedAImember) return;
        setIsGenerating(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.post(`http://localhost:8080/api/workout-plans/ai-generate/${selectedAImember.id}`, selectedAImember, {
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
            await axios.post(`http://localhost:8080/api/workout-plans/${id}/confirm`, pendingPlan, {
                headers: { Authorization: auth }
            });
            setShowReviewModal(false);
            setPendingPlan(null);
            fetchPlans(user);
        } catch (err) { alert("Confirmation Failed"); }
    };

    const deactivatePlan = async (id) => {
        if (!window.confirm("Stop this routine?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/workout-plans/${id}/deactivate`, {}, {
                headers: { Authorization: auth }
            });
            fetchPlans(user);
        } catch (err) { alert("Deactivation failed."); }
    };

    const renderSidebar = () => {
        if (user?.role === 'ADMIN') return <AdminSidebar activePage="workout-plans" />;
        if (user?.role === 'TRAINER') return <TrainerSidebar activePage="workout-plans" />;
        return <MemberSidebar activePage="workout-plans" />;
    };

    const isMember = user?.role === 'MEMBER';
    const isTrainer = user?.role === 'TRAINER';

    return (
        <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200">
            {user && renderSidebar()}

            <main className="ml-64 flex-1 flex flex-col min-h-screen relative overflow-hidden">
                {/* Background Ambient Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 px-10 pt-10">
                    <header className="flex justify-between items-center mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-blue-400">
                                <Zap size={18} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Technical Command Hub</span>
                            </div>
<<<<<<< Updated upstream
                            <h1 className="text-4xl font-black text-white tracking-tight">Kinetic <span className="text-blue-500">Sequences</span></h1>
=======
                            <h1 className="text-4xl font-black text-white tracking-tight">Workout<span className="text-blue-500"> Routine</span></h1>
>>>>>>> Stashed changes
                        </div>

                        {isTrainer && (
                            <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-2xl">
<<<<<<< Updated upstream
                                <button 
=======
                                <button
>>>>>>> Stashed changes
                                    onClick={() => setActiveTab('AI_HUB')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'AI_HUB' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Sparkles size={14} /> AI Predictor
                                </button>
<<<<<<< Updated upstream
                                <button 
=======
                                <button
>>>>>>> Stashed changes
                                    onClick={() => setActiveTab('MANAGEMENT')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MANAGEMENT' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Activity size={14} /> Management
                                </button>
                            </div>
                        )}
                    </header>
<<<<<<< Updated upstream

                    <div className="min-h-[70vh]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'AI_HUB' && isTrainer ? (
                                <motion.div 
                                    key="ai-hub-workout"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="relative z-10 max-w-2xl">
                                            <h2 className="text-4xl font-black mb-4 leading-tight">Neural Training <br /> Architect.</h2>
                                            <p className="text-blue-100 font-medium text-lg mb-8 opacity-90">Deep-calculate optimal volume, frequency, and load for your athletes based on their current physiological bio-data.</p>
                                        </div>
                                        <div className="absolute right-[-5%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
                                            <BrainCircuit size={400} />
                                        </div>
                                    </div>

=======

                    <div className="min-h-[70vh]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'AI_HUB' && isTrainer ? (
                                <motion.div
                                    key="ai-hub-workout"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="relative z-10 max-w-2xl">
                                            <h2 className="text-4xl font-black mb-4 leading-tight">Neural Training <br /> Architect.</h2>
                                            <p className="text-blue-100 font-medium text-lg mb-8 opacity-90">Deep-calculate optimal volume, frequency, and load for your athletes based on their current physiological bio-data.</p>
                                        </div>
                                        <div className="absolute right-[-5%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
                                            <BrainCircuit size={400} />
                                        </div>
                                    </div>

>>>>>>> Stashed changes
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {members.map(member => (
                                            <motion.button
                                                whileHover={{ scale: 1.02, y: -5 }}
                                                key={member.id}
                                                onClick={() => handleAIRequest(member)}
                                                className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 hover:border-blue-500/50 transition-all text-left flex flex-col justify-between min-h-[180px] group shadow-xl"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 font-black text-xl">
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{member.fitnessGoal || 'No Goal'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-lg mb-1">@{member.username}</p>
                                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                                                        Engineer Routine <ChevronRight size={12} />
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
<<<<<<< Updated upstream
                                <motion.div 
=======
                                <motion.div
>>>>>>> Stashed changes
                                    key="management-workout"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-end mb-8">
                                        <div className="relative">
                                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
<<<<<<< Updated upstream
                                            <select 
                                                value={selectedMember} 
=======
                                            <select
                                                value={selectedMember}
>>>>>>> Stashed changes
                                                onChange={e => setSelectedMember(e.target.value)}
                                                className="bg-white/5 border border-white/10 pl-12 pr-10 py-3 rounded-2xl text-sm font-bold appearance-none focus:outline-none focus:border-blue-500 text-white min-w-[220px]"
                                            >
                                                <option value="ALL" className="bg-slate-900">All Active Athletes</option>
                                                {members.map(m => <option key={m.id} value={m.id} className="bg-slate-900">@{m.username}</option>)}
                                            </select>
                                        </div>

<<<<<<< Updated upstream
                                        <button 
                                            onClick={() => setShowCreateModal(true)}
                                            className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                                        >
                                            <Plus size={18} strokeWidth={3} /> Manual Sequence
                                        </button>
=======
                                        {isTrainer && (
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                                            >
                                                <Plus size={18} strokeWidth={3} /> Manual Sequence
                                            </button>
                                        )}
>>>>>>> Stashed changes
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {plans.length > 0 ? plans.map((plan, idx) => (
                                            <div key={plan.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden shadow-2xl">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${plan.isAiGenerated ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                            {plan.isAiGenerated ? <BrainCircuit size={28} /> : <Dumbbell size={28} />}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-white mb-1">{plan.planName}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{plan.isAiGenerated ? 'Neural Optimized' : 'Standard Routine'}</span>
                                                                <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded uppercase tracking-tighter">@{plan.memberUsername}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isTrainer && plan.status === 'CURRENT' && (
                                                        <button onClick={() => deactivatePlan(plan.id)} className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                                    )}
                                                </div>

                                                <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                                                    <div className="space-y-3">
                                                        {(() => {
                                                            try {
                                                                const exs = JSON.parse(plan.exercises);
                                                                if (Array.isArray(exs)) {
                                                                    return exs.map((ex, i) => (
                                                                        <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                                                                            <span className="font-black text-white">{ex.name}</span>
                                                                            <span className="text-slate-500 text-xs font-bold">{ex.setsReps}</span>
                                                                        </div>
                                                                    ));
                                                                }
<<<<<<< Updated upstream
                                                            } catch (e) {}
=======
                                                            } catch (e) { }
>>>>>>> Stashed changes
                                                            return <p className="text-sm text-slate-400">{plan.exercises}</p>;
                                                        })()}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest"><Calendar size={14} /> {plan.createdDate}</div>
                                                        <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">{plan.difficulty}</div>
                                                    </div>
<<<<<<< Updated upstream
                                                    {plan.status === 'REVIEW_PENDING' && (
=======
                                                    {isTrainer && plan.status === 'REVIEW_PENDING' && (
>>>>>>> Stashed changes
                                                        <button onClick={() => { setPendingPlan(plan); setShowReviewModal(true); }} className="bg-amber-500/20 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all">Review Protocol</button>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-50">
                                                <Dumbbell size={48} className="text-slate-700 mb-4" />
                                                <p className="font-black text-slate-500">No Training Protocols Data.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Modals - Cleaned UI */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 w-full max-w-4xl rounded-[3.5rem] p-12 relative shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]">
                                <button onClick={() => setShowCreateModal(false)} className="absolute right-8 top-8 text-slate-500 hover:text-white"><X size={28} /></button>
<<<<<<< Updated upstream
                                <h2 className="text-4xl font-black mb-10 text-white leading-tight">Technical Manual <br /><span className="text-blue-500">Sequence Entry</span></h2>
=======
                                <h2 className="text-4xl font-black mb-10 text-white leading-tight">Technical Manual <br /><span className="text-blue-500"></span></h2>
>>>>>>> Stashed changes
                                <form onSubmit={handleCreatePlan} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 px-1">Athlete Selection</label>
<<<<<<< Updated upstream
                                            <select className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold outline-none focus:border-blue-500" value={newPlan.memberId} onChange={e => setNewPlan({...newPlan, memberId: e.target.value})} required>
=======
                                            <select className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold outline-none focus:border-blue-500" value={newPlan.memberId} onChange={e => setNewPlan({ ...newPlan, memberId: e.target.value })} required>
>>>>>>> Stashed changes
                                                <option value="" className="bg-slate-900">Choose Athlete</option>
                                                {members.map(m => <option key={m.id} value={m.id} className="bg-slate-900">@{m.username}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 px-1">Load Intensity</label>
<<<<<<< Updated upstream
                                            <select className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold outline-none" value={newPlan.difficulty} onChange={e => setNewPlan({...newPlan, difficulty: e.target.value})}>
=======
                                            <select className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-bold outline-none" value={newPlan.difficulty} onChange={e => setNewPlan({ ...newPlan, difficulty: e.target.value })}>
>>>>>>> Stashed changes
                                                <option value="BEGINNER" className="bg-slate-900">Beginner (Adaptation)</option>
                                                <option value="INTERMEDIATE" className="bg-slate-900">Intermediate (Hypertrophy)</option>
                                                <option value="ADVANCED" className="bg-slate-900">Advanced (Elite)</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 px-1">Protocol Identifier</label>
<<<<<<< Updated upstream
                                        <input className="w-full bg-white/5 p-5 rounded-3xl border border-white/10 text-white font-black text-lg outline-none focus:border-blue-500" placeholder="e.g. Posterior Chain Overload" value={newPlan.planName} onChange={e => setNewPlan({...newPlan, planName: e.target.value})} required />
=======
                                        <input className="w-full bg-white/5 p-5 rounded-3xl border border-white/10 text-white font-black text-lg outline-none focus:border-blue-500" placeholder="e.g. Posterior Chain Overload" value={newPlan.planName} onChange={e => setNewPlan({ ...newPlan, planName: e.target.value })} required />
>>>>>>> Stashed changes
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">Kinetic Exercises</label>
                                            <button type="button" onClick={addExerciseRow} className="text-blue-500 text-[10px] font-black uppercase tracking-widest">+ Append Exercise</button>
                                        </div>
                                        <div className="space-y-3">
                                            {newPlan.exercises.map((ex, index) => (
                                                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-white/5 p-5 rounded-3xl border border-white/5 group">
                                                    <div className="col-span-4">
                                                        <select className="w-full bg-slate-800 p-3 rounded-xl border border-white/10 text-sm text-white font-bold" value={ex.name} onChange={e => updateExercise(index, 'name', e.target.value)} required>
                                                            <option value="">Move</option>
                                                            {Object.entries(EXERCISE_LIBRARY).map(([cat, list]) => (
                                                                <optgroup key={cat} label={cat}>{list.map(name => <option key={name} value={name}>{name}</option>)}</optgroup>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <select className="w-full bg-slate-800 p-3 rounded-xl border border-white/10 text-sm text-white font-bold" value={ex.equipmentId} onChange={e => updateExercise(index, 'equipmentId', e.target.value)}>
                                                            <option value="">Station</option>
                                                            {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name} ({eq.brand})</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <input className="w-full bg-slate-800 p-3 rounded-xl border border-white/10 text-sm text-white font-bold" placeholder="Sets" value={ex.sets} onChange={e => updateExercise(index, 'sets', e.target.value)} />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <input className="w-full bg-slate-800 p-3 rounded-xl border border-white/10 text-sm text-white font-bold" placeholder="Reps" value={ex.reps} onChange={e => updateExercise(index, 'reps', e.target.value)} />
                                                    </div>
                                                    <div className="col-span-1 flex justify-center pb-2">
                                                        <button type="button" onClick={() => removeExerciseRow(index)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={20} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="w-full bg-blue-600 text-white py-5 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-blue-500 transition-all">Submit Technical Protocol</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* AI Review Modal - Cleaned */}
                <AnimatePresence>
                    {showReviewModal && pendingPlan && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 w-full max-w-2xl rounded-[3rem] p-12 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
                                <h3 className="text-3xl font-black text-white mb-8 flex items-center gap-4"><BrainCircuit className="text-blue-500" size={32} /> Routine Verification</h3>
                                <div className="space-y-6 mb-10">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Regime Identifier</label>
<<<<<<< Updated upstream
                                        <input className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-black text-lg" value={pendingPlan.planName} onChange={e => setPendingPlan({...pendingPlan, planName: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Sequence Correction (Raw Data)</label>
                                        <textarea className="w-full bg-white/5 p-6 rounded-[2rem] border border-white/10 text-white font-medium min-h-[300px] text-sm" value={pendingPlan.exercises} onChange={e => setPendingPlan({...pendingPlan, exercises: e.target.value})} />
=======
                                        <input className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white font-black text-lg" value={pendingPlan.planName} onChange={e => setPendingPlan({ ...pendingPlan, planName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Sequence Correction (Raw Data)</label>
                                        <textarea className="w-full bg-white/5 p-6 rounded-[2rem] border border-white/10 text-white font-medium min-h-[300px] text-sm" value={pendingPlan.exercises} onChange={e => setPendingPlan({ ...pendingPlan, exercises: e.target.value })} />
>>>>>>> Stashed changes
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowReviewModal(false)} className="flex-1 py-4 border border-white/10 rounded-2xl font-black text-slate-500">Archive Draft</button>
                                    <button onClick={() => confirmAIPlan(pendingPlan.id)} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20">Validate & Deploy</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* AI Bio Modal */}
                <AnimatePresence>
                    {showAIPreview && selectedAImember && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 border border-white/10">
                                <div className="flex items-center gap-4 mb-8">
<<<<<<< Updated upstream
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400"><User size={32}/></div>
=======
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400"><User size={32} /></div>
>>>>>>> Stashed changes
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Bio-Engine Check</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Athlete Profile - @{selectedAImember.username}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Age</label>
<<<<<<< Updated upstream
                                        <input type="number" className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5" value={selectedAImember.age || ''} onChange={e => setSelectedAIMember({...selectedAImember, age: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Gender</label>
                                        <input className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5" value={selectedAImember.gender || ''} onChange={e => setSelectedAIMember({...selectedAImember, gender: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Weight (kg)</label>
                                        <input type="number" className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5" value={selectedAImember.weight || ''} onChange={e => setSelectedAIMember({...selectedAImember, weight: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Height (cm)</label>
                                        <input type="number" className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5" value={selectedAImember.height || ''} onChange={e => setSelectedAIMember({...selectedAImember, height: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div className="space-y-4 mb-10">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Strategic Objective</label>
                                        <select className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5 outline-none" value={selectedAImember.fitnessGoal || ''} onChange={e => setSelectedAIMember({...selectedAImember, fitnessGoal: e.target.value})}>
                                            <option value="Weight Loss" className="bg-slate-900">Fat Oxidation (Weight Loss)</option>
                                            <option value="Weight Gain" className="bg-slate-900">Mass Accrual (Weight Gain)</option>
                                            <option value="Muscle Hypertrophy" className="bg-slate-900">Muscle Hypertrophy</option>
                                            <option value="Endurance" className="bg-slate-900">Endurance / Stamina</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Medical Conditions / Injuries</label>
                                        <textarea className="w-full bg-white/5 p-3 rounded-xl text-white font-medium border border-white/5 h-24 text-sm outline-none focus:border-blue-500 transition-all custom-scrollbar shrink-0" value={selectedAImember.healthDetails || ''} onChange={e => setSelectedAIMember({...selectedAImember, healthDetails: e.target.value})} placeholder="List any limiting health factors..."></textarea>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowAIPreview(false)} className="flex-1 py-4 border border-white/10 rounded-2xl font-black text-slate-500">Cancel</button>
                                    <button onClick={triggerAI} disabled={isGenerating} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                        {isGenerating ? 'Computing...' : <><Sparkles size={16}/> Start Optimization</>}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

=======
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
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Strategic Objective</label>
                                        <select className="w-full bg-white/5 p-3 rounded-xl text-white font-bold border border-white/5 outline-none" value={selectedAImember.fitnessGoal || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, fitnessGoal: e.target.value })}>
                                            <option value="Weight Loss" className="bg-slate-900">Fat Oxidation (Weight Loss)</option>
                                            <option value="Weight Gain" className="bg-slate-900">Mass Accrual (Weight Gain)</option>
                                            <option value="Muscle Hypertrophy" className="bg-slate-900">Muscle Hypertrophy</option>
                                            <option value="Endurance" className="bg-slate-900">Endurance / Stamina</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Medical Conditions / Injuries</label>
                                        <textarea className="w-full bg-white/5 p-3 rounded-xl text-white font-medium border border-white/5 h-24 text-sm outline-none focus:border-blue-500 transition-all custom-scrollbar shrink-0" value={selectedAImember.healthDetails || ''} onChange={e => setSelectedAIMember({ ...selectedAImember, healthDetails: e.target.value })} placeholder="List any limiting health factors..."></textarea>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowAIPreview(false)} className="flex-1 py-4 border border-white/10 rounded-2xl font-black text-slate-500">Cancel</button>
                                    <button onClick={triggerAI} disabled={isGenerating} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                        {isGenerating ? 'Computing...' : <><Sparkles size={16} /> Start Optimization</>}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

>>>>>>> Stashed changes
            </main>
        </div>
    );
};

export default WorkoutPlanManagement;

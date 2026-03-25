import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle, Activity, Target, Dumbbell, Send, 
    RefreshCw, Clock, TrendingUp, Calendar, ArrowRight, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';
import MemberSidebar from '../components/MemberSidebar';

const MemberWorkoutTracking = () => {
    const [currentPlan, setCurrentPlan] = useState(null);
    const [history, setHistory] = useState([]);
    const [weeklySummary, setWeeklySummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [logStatus, setLogStatus] = useState({}); 
    const [equipmentStatus, setEquipmentStatus] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Generate the last 7 dates for the switcher
    const getWeekDays = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d);
        }
        return dates;
    };
    const [weekDays] = useState(getWeekDays());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const init = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            setUser(storedUser);
            
            // Local YYYY-MM-DD generation
            const dateStr = selectedDate.toLocaleDateString('en-CA');
            const savedProgress = localStorage.getItem(`workout_progress_${storedUser.id}_${dateStr}`);
            
            if (savedProgress) {
                setLogStatus(JSON.parse(savedProgress));
            } else {
                setLogStatus({});
            }
            await fetchData(storedUser.id);
            await fetchEquipmentStatus();
        };
        init();
    }, [selectedDate]);

    const fetchEquipmentStatus = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/member/equipment-status', {
                headers: { Authorization: auth }
            });
            setEquipmentStatus(res.data);
        } catch (err) {
            console.error("Equipment status fetch failed", err);
        }
    };

    const fetchData = async (memberId) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (!auth) return;
            const headers = { Authorization: auth };

            // 1. Fetch Plans
            const plansRes = await axios.get(`http://localhost:8080/api/workout-plans/member/${memberId}`, { headers });
            // Sort all plans by ID or createdDate DESC to ensure we deal with latest first
            const allPlans = (plansRes.data || []).sort((a, b) => b.id - a.id);
            
            // Find the active protocol (CURRENT) - definitely take the one with the highest ID if multiple exist (though logic should prevent it)
            const current = allPlans.find(p => p.status === 'CURRENT');
            
            // History: everything that is ARCHIVED OR not the current one
            const past = allPlans.filter(p => p.id !== (current?.id || -1))
                                 .sort((a, b) => b.id - a.id);
            
            console.log("Verified Current Plan:", current);
            console.log("Verified Past Plans:", past);

            setCurrentPlan(current || null);
            setHistory(past);

            // 2. Fetch Weekly Summary
            try {
                const summaryRes = await axios.get(`http://localhost:8080/api/workout-plans/weekly-summary`, { headers });
                setWeeklySummary(summaryRes.data);
            } catch (summaryErr) {
                console.warn("Summary fetch failed, might be new user", summaryErr);
                setWeeklySummary({ logs: [], averageCompletion: 0, totalLogs: 0 });
            }

        } catch (err) {
            console.error("Fetch tracking data failed", err);
        } finally {
            setLoading(false);
        }
    };

    const parseExercises = (exerciseStr) => {
        if (!exerciseStr) return [];
        try {
            // Attempt to parse as JSON (new structured format)
            const parsed = JSON.parse(exerciseStr);
            if (Array.isArray(parsed)) {
                return parsed.map((ex, index) => {
                    const statusInfo = equipmentStatus.find(e => e.id.toString() === ex.equipmentId?.toString());
                    return {
                        id: index,
                        ...ex,
                        isWorking: statusInfo ? statusInfo.status === 'WORKING' : true,
                        alternativeName: statusInfo?.alternativeName || 'Consult Trainer',
                        currentStatus: statusInfo?.status || 'WORKING'
                    };
                });
            }
        } catch (e) {
            // Fallback: Handle legacy newline-separated format
            return exerciseStr.split('\n').filter(line => line.trim() !== '').map((line, index) => ({
                id: index,
                name: line.trim(),
                equipmentName: 'No Equipment',
                setsReps: 'N/A'
            }));
        }
        return [];
    };

    const handleTick = (id) => {
        // Validation: Cannot tick for future dates
        if (selectedDate > new Date()) return;

        const newStatus = {
            ...logStatus,
            [id]: !logStatus[id]
        };
        setLogStatus(newStatus);
        const dateStr = selectedDate.toLocaleDateString('en-CA');
        localStorage.setItem(`workout_progress_${user.id}_${dateStr}`, JSON.stringify(newStatus));
    };

    const submitDailyLog = async () => {
        if (!currentPlan) return;
        
        // Validation: Cannot log for future
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) {
            alert("This is a future date. Focus on today's grind!");
            return;
        }

        setIsSubmitting(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const exercises = parseExercises(currentPlan.exercises);
            const total = exercises.length;
            const completedCount = Object.values(logStatus).filter(v => v).length;
            const percentage = total > 0 ? (completedCount / total) * 100 : 0;

            const exercisesJson = JSON.stringify(exercises.map(ex => ({
                name: ex.name,
                completed: !!logStatus[ex.id]
            })));

            const dateStr = selectedDate.toLocaleDateString('en-CA');

            await axios.post('http://localhost:8080/api/workout-plans/log', {
                planId: currentPlan.id,
                exercisesJson,
                percentage,
                logDate: dateStr
            }, { headers: { Authorization: auth }});

            alert(`Activity for ${selectedDate.toDateString()} successfully logged!`);
            fetchData(user.id);
        } catch (err) {
            alert("Logging failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateDailyProgress = () => {
        if (!currentPlan) return 0;
        const total = parseExercises(currentPlan.exercises).length;
        if (total === 0) return 0;
        const completed = Object.values(logStatus).filter(v => v).length;
        return Math.round((completed / total) * 100);
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold tracking-tighter text-2xl animate-pulse italic">SYNCING PERFORMANCE DATA...</div>;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <MemberSidebar activePage="workout-plans" />
            
            <main className="ml-64 flex-1 flex flex-col">
                <div className="bg-slate-900 px-10 py-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <MemberHeader 
                            title="Daily Grit & Weekly Glory" 
                            subtitle="Record daily discipline. Review weekly dominance." 
                            lightTheme={true} 
                        />
                        <div className="bg-blue-600/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl">
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Weekly Consistency</div>
                            <div className="text-3xl font-black text-white">{ (weeklySummary?.averageCompletion || 0).toFixed(1) }%</div>
                        </div>
                    </div>
                </div>

                <div className="p-10 max-w-7xl mx-auto w-full space-y-12">
                    
                    {/* Part 1: Daily Discipline */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-1.5 bg-blue-600 rounded-full"></div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Daily <span className="text-blue-600">Discipline</span></h2>
                        </div>

                        {/* Day Switcher - Real Calendar Dates */}
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                            {weekDays.map((date, idx) => {
                                const isSelected = selectedDate.toDateString() === date.toDateString();
                                const isFuture = date > new Date();
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDate(date)}
                                        className={`px-6 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-300 min-w-max flex flex-col items-center gap-1 ${
                                            isSelected 
                                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 ring-4 ring-blue-500/10' 
                                            : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-300'
                                        } ${isFuture ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                    >
                                        <span className="opacity-60">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="text-sm">{date.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Exercise Checklist */}
                            <div className="lg:col-span-2">
                                <motion.div 
                                    key={selectedDate.toISOString()}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden"
                                >
                                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                                <Clock className="text-blue-600" /> {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                            </h3>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Check as you finish each set</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black text-blue-600 tracking-tighter">{calculateDailyProgress()}%</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase">Focus Rate</div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-4">
                                        {currentPlan ? (
                                            parseExercises(currentPlan.exercises).map((ex) => (
                                                <div 
                                                    key={ex.id}
                                                    onClick={() => handleTick(ex.id)}
                                                    className={`group flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                                                        logStatus[ex.id] 
                                                        ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/5' 
                                                        : 'bg-white border-slate-50 hover:border-blue-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-5 flex-1">
                                                        <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                                            logStatus[ex.id] ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30' : 'border-slate-100 bg-slate-50'
                                                        }`}>
                                                            {logStatus[ex.id] && <CheckCircle size={20} />}
                                                        </div>
                                                            <div className="flex flex-col">
                                                                <span className={`text-lg font-black tracking-tight ${logStatus[ex.id] ? 'text-slate-900 line-through opacity-40' : 'text-slate-900'}`}>
                                                                    {ex.name}
                                                                </span>
                                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                                                        !ex.isWorking ? 'bg-red-500 text-white' : 
                                                                        logStatus[ex.id] ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                                                                        {ex.equipmentName || 'No Equipment'} {!ex.isWorking && '(BROKEN)'}
                                                                    </span>
                                                                    {ex.setsReps && (
                                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${logStatus[ex.id] ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                                                            {ex.setsReps}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Alternative Recommendation if Broken */}
                                                                {!ex.isWorking && (
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        className="mt-3 bg-red-50 border border-red-100 p-3 rounded-2xl flex items-center gap-3"
                                                                    >
                                                                        <div className="w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center animate-pulse">
                                                                            <AlertTriangle size={12} />
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-red-700 leading-tight">
                                                                            <span className="uppercase tracking-widest block opacity-70">Strategic Alternate</span>
                                                                            Use <span className="underline decoration-2">{ex.alternativeName}</span> instead today.
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center">
                                                <RefreshCw size={40} className="mx-auto text-slate-200 animate-spin-slow mb-6" />
                                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Awaiting Trainer's Master Plan</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 pt-0">
                                        <button 
                                            onClick={submitDailyLog}
                                            disabled={isSubmitting || !currentPlan || selectedDate > new Date()}
                                            className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 group"
                                        >
                                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                                            {selectedDate > new Date() ? 'Locked (Future)' : (isSubmitting ? 'Recording Grit...' : `Record Performance`)}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Plan Card */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                                <div className="relative z-10">
                                    <Target className="text-blue-500 mb-6" size={40} />
                                    <h3 className="text-3xl font-black leading-none mb-2">ACTIVE<br/>PROTOCOL</h3>
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-10">Mission Parameters</p>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Strategy</div>
                                            <div className="text-xl font-black text-white italic">{currentPlan?.planName || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Intensity</div>
                                            <span className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">{currentPlan?.difficulty || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <Dumbbell size={200} className="absolute bottom-[-10%] right-[-10%] text-white opacity-5 rotate-12" />
                            </div>
                        </div>
                    </div>

                    {/* Part 2: Weekly Glory (Analysis) */}
                    <div className="space-y-8 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-1.5 bg-emerald-500 rounded-full"></div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Weekly <span className="text-emerald-500">Glory</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                                <Activity className="text-blue-500 mb-6" />
                                <div>
                                    <div className="text-4xl font-black text-slate-900">{(weeklySummary?.averageCompletion || 0).toFixed(0)}%</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consistency Score</div>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                                <Calendar className="text-purple-500 mb-6" />
                                <div>
                                    <div className="text-4xl font-black text-slate-900">{weeklySummary?.totalLogs || 0}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Tracked</div>
                                </div>
                            </div>
                            <div className="bg-emerald-500 p-8 rounded-[2rem] text-white flex flex-col justify-between ring-8 ring-emerald-500/10">
                                <TrendingUp className="mb-6" />
                                <div>
                                    <div className="text-4xl font-black">Elite</div>
                                    <div className="text-[10px] font-black opacity-80 uppercase tracking-widest">Performance Tier</div>
                                </div>
                            </div>
                            <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col justify-between">
                                <Target className="text-blue-500 mb-6" />
                                <div>
                                    <div className="text-4xl font-black italic">ON TRACK</div>
                                    <div className="text-[10px] font-black opacity-50 uppercase tracking-widest">Goal Status</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent History Table - Comparison View */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 p-10">
                            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center justify-between">
                                <span>LATEST LOG ENTRIES</span>
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">Last 7 Active Records</span>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Session</th>
                                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workout Protocol</th>
                                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intensity Map</th>
                                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Completion</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {weeklySummary?.logs && weeklySummary.logs.length > 0 ? (
                                            weeklySummary.logs
                                                .slice()
                                                .sort((a,b) => new Date(a.date) - new Date(b.date))
                                                .reverse()
                                                .map((log, i) => (
                                                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-6">
                                                        <div className="font-black text-slate-900">{log.date}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })} Session</div>
                                                    </td>
                                                    <td className="py-6">
                                                        <div className="text-sm font-black text-blue-600 italic tracking-tight">{log.planName || 'Standard Protocol'}</div>
                                                    </td>
                                                    <td className="py-6">
                                                        <div className="flex gap-1">
                                                            {[1,2,3,4,5].map(dot => (
                                                                <div key={dot} className={`h-1.5 w-6 rounded-full ${dot <= (log.completionPercentage/20) ? 'bg-blue-500' : 'bg-slate-100'}`}></div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 text-right">
                                                        <span className={`font-black text-lg ${log.completionPercentage >= 80 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                            {log.completionPercentage.toFixed(0)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="py-10 text-center font-bold text-slate-300 italic uppercase text-xs tracking-widest">No Recent Combat Logs Found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Part 3: Evolution (Version Comparison) */}
                    <div className="space-y-8 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-1.5 bg-slate-900 rounded-full"></div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Evolution <span className="text-blue-600">Archive</span></h2>
                        </div>

                        {history.length > 0 && currentPlan && (
                            <div className="bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                                    <div className="max-w-md">
                                        <div className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/20">Structural Analysis</div>
                                        <h3 className="text-5xl font-black tracking-tighter italic leading-none mb-6">INTEL<br/>COMPARISON</h3>
                                        <p className="text-blue-100 font-bold leading-relaxed">Cross-referencing your active protocol against the previous milestone to verify absolute gains.</p>
                                    </div>

                                    <div className="flex items-center gap-6 sm:gap-12 w-full xl:w-auto">
                                        <div className="flex-1 text-center bg-white/10 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm group-hover:-translate-y-2 transition-transform duration-500">
                                            <div className="text-[10px] font-black text-blue-200 uppercase mb-4 tracking-widest">Previous Peak</div>
                                            <div className="text-3xl font-black italic">{history[0].difficulty}</div>
                                            <div className="text-[10px] font-bold opacity-60 mt-2">{history[0].planName}</div>
                                        </div>
                                        <div className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                                            <ArrowRight size={32} />
                                        </div>
                                        <div className="flex-1 text-center bg-slate-950/20 p-8 rounded-[2.5rem] border-2 border-white/30 ring-8 ring-white/5 group-hover:-translate-y-2 transition-transform duration-500 delay-100">
                                            <div className="text-[10px] font-black text-blue-200 uppercase mb-4 tracking-widest">Active Zenit</div>
                                            <div className="text-3xl font-black italic">{currentPlan.difficulty}</div>
                                            <div className="text-[10px] font-bold opacity-60 mt-2">{currentPlan.planName}</div>
                                        </div>
                                    </div>
                                </div>
                                <Activity size={500} className="absolute right-[-10%] top-[-10%] text-white opacity-5 rotate-12" />
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* If there are NO archived plans yet */}
                            {history.length === 0 && (
                                <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                    <Clock className="mx-auto text-slate-200 mb-4" size={48} />
                                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No Evolution Data Recorded Yet</p>
                                </div>
                            )}

                            {history.map((plan, idx) => (
                                <motion.div 
                                    key={plan.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative group overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8">
                                        <div className="bg-slate-50 text-slate-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-100">
                                            v.{history.length - idx}
                                        </div>
                                    </div>

                                    <div className="w-16 h-16 bg-slate-100/50 rounded-2xl flex items-center justify-center text-slate-400 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                        <Dumbbell size={28} />
                                    </div>

                                    <h4 className="text-2xl font-black text-slate-900 mb-2 italic leading-tight group-hover:text-blue-600 transition-colors">
                                        "{plan.planName}"
                                    </h4>
                                    
                                    <div className="flex items-center gap-2 mb-8">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">{plan.difficulty} Strategy</p>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exercise Core</div>
                                        <div className="bg-slate-50 p-6 rounded-3xl text-sm font-bold text-slate-500 leading-relaxed italic border border-slate-100/50 max-h-40 overflow-y-auto scrollbar-hide">
                                            {plan.exercises?.split('\n').map((ex, i) => (
                                                <div key={i} className="flex items-center gap-2 mb-2">
                                                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                                    {ex}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-50 flex justify-between items-center group-hover:border-blue-50 transition-colors">
                                        <div>
                                            <div className="text-[9px] font-black text-slate-300 uppercase underline decoration-blue-500/30 decoration-2">Deactivated On</div>
                                            <div className="text-[11px] font-black text-slate-400 mt-1">{plan.createdDate}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-slate-300 uppercase">Status</div>
                                            <div className="text-[11px] font-black text-slate-900 mt-1 uppercase italic">Archived</div>
                                        </div>
                                    </div>

                                    {/* Abstract background symbol */}
                                    <TrendingUp size={120} className="absolute bottom-[-20px] right-[-20px] text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -rotate-12" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default MemberWorkoutTracking;

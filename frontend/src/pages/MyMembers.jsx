import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import TrainerHeader from '../components/TrainerHeader';
import { Users, Search, Activity, ExternalLink, X, Save, Ruler, Weight, Calendar, FileText, Box, Facebook, Twitter, Instagram, TrendingUp, Phone, User as UserIcon, Send } from 'lucide-react';
import axios from 'axios';

const MyMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMember, setEditingMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [fitnessForm, setFitnessForm] = useState({
        age: '', height: '', weight: '', gender: '', phoneNumber: '', fitnessGoal: '', allergies: '',
        chest: '', waist: '', biceps: '', thighs: '', healthDetails: ''
    });
    const [selectedMemberProgress, setSelectedMemberProgress] = useState(null);
    const [progressData, setProgressData] = useState([]);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedMemberForMsg, setSelectedMemberForMsg] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [workoutPerformance, setWorkoutPerformance] = useState(null);

    const fetchMembers = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/trainer/my-members', {
                headers: { Authorization: auth }
            });
            setMembers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText || messageText.trim().length < 10) {
            alert("Validation Error: Your advisory message must be at least 10 characters long to provide substantive value.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/trainer/send-member-message', {
                memberId: selectedMemberForMsg.id,
                message: messageText
            }, {
                headers: { Authorization: auth }
            });
            alert("Guidance message successfully dispatched!");
            setShowMessageModal(false);
            setMessageText('');
        } catch (err) {
            console.error(err);
            alert("Failed to send message: " + (err.response?.data || err.message));
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const openEdit = (member) => {
        setEditingMember(member);
        setFitnessForm({
            age: member.age || '',
            height: member.height || '',
            weight: member.weight || '',
            gender: member.gender || '',
            phoneNumber: member.phoneNumber || '',
            fitnessGoal: member.fitnessGoal || '',
            allergies: member.allergies || '',
            chest: member.chest || '',
            waist: member.waist || '',
            biceps: member.biceps || '',
            thighs: member.thighs || '',
            healthDetails: member.healthDetails || ''
        });
    };

    const fetchMemberProgress = async (member) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            
            // Fetch Biometric Progress
            const bioRes = await axios.get(`http://localhost:8080/api/trainer/member/${member.id}/progress`, {
                headers: { Authorization: auth }
            });
            setProgressData(bioRes.data);

            // Fetch Workout Performance Logs
            const perfRes = await axios.get(`http://localhost:8080/api/workout-plans/member/${member.id}/performance`, {
                headers: { Authorization: auth }
            });
            setWorkoutPerformance(perfRes.data);

            setSelectedMemberProgress(member);
            setShowProgressModal(true);
        } catch (err) {
            console.error("Failed to fetch progress", err);
            alert("Could not load member progress.");
        }
    };

    const openMessageModal = (member) => {
        setSelectedMemberForMsg(member);
        setMessageText('');
        setShowMessageModal(true);
    };

    const SimpleChart = ({ data, dates, color, id }) => {
        if (!data || data.length < 2) return <div className="h-48 flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">Not enough data to generate graph.</div>;

        const max = Math.max(...data) * 1.1;
        const min = Math.min(...data) * 0.9;
        const range = max - min || 1;
        const width = 800;
        const height = 200;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="relative flex flex-col gap-2">
                <div className="relative h-48 w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 overflow-hidden">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M 0,${height} L ${points} L ${width},${height} Z`}
                            fill={`url(#gradient-${id})`}
                        />
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            d={`M ${points}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                {dates && (
                    <div className="flex justify-between px-2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {dates.map((date, idx) => (
                            <span key={idx} className={idx === 0 || idx === dates.length - 1 || idx % Math.ceil(dates.length/4) === 0 ? 'block' : 'hidden'}>
                                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const RadarChart = ({ data }) => {
        const labels = ['Chest', 'Waist', 'Biceps', 'Thighs'];
        const latest = data && data.length > 0 ? data[data.length - 1] : {};
        const values = [latest.chest || 0, latest.waist || 0, latest.biceps || 0, latest.thighs || 0];
        const maxVal = Math.max(...values, 40);
        
        const size = 250;
        const center = size / 2;
        const radius = size * 0.4;
        
        const getPoint = (val, i, total) => {
            const factor = (val / maxVal) * radius;
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
            return {
                x: center + factor * Math.cos(angle),
                y: center + factor * Math.sin(angle)
            };
        };

        const polygonPoints = values.map((v, i) => {
            const p = getPoint(v, i, values.length);
            return `${p.x},${p.y}`;
        }).join(' ');

        return (
            <div className="flex flex-col items-center">
                <svg width={size} height={size} className="overflow-visible">
                    {[0.2, 0.4, 0.6, 0.8, 1].map((f, idx) => (
                        <circle key={idx} cx={center} cy={center} r={radius * f} fill="none" stroke="#e2e8f0" strokeDasharray="4" />
                    ))}
                    {labels.map((_, i) => {
                        const p = getPoint(maxVal, i, labels.length);
                        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
                    })}
                    <motion.polygon
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        points={polygonPoints}
                        fill="rgba(16, 185, 129, 0.2)"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />
                    {labels.map((label, i) => {
                        const p = getPoint(maxVal * 1.3, i, labels.length);
                        return (
                            <text key={i} x={p.x} y={p.y} textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase tracking-widest">
                                {label}
                            </text>
                        );
                    })}
                </svg>
            </div>
        );
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));

            const validations = [
                { field: 'age', label: 'Age' },
                { field: 'height', label: 'Height' },
                { field: 'weight', label: 'Weight' },
                { field: 'chest', label: 'Chest' },
                { field: 'waist', label: 'Waist' },
                { field: 'biceps', label: 'Biceps' },
                { field: 'thighs', label: 'Thighs' }
            ];

            for (const v of validations) {
                const val = fitnessForm[v.field];
                if (val !== '' && parseFloat(val) <= 0) {
                    alert(`${v.label} must be a positive value greater than zero.`);
                    return;
                }
            }

            if (fitnessForm.allergies.trim() !== '' && fitnessForm.allergies.trim().length < 5) {
                alert("Validation Error: Please provide a descriptive entry for 'Allergies' (at least 5 characters).");
                return;
            }

            if (fitnessForm.healthDetails.trim() !== '' && fitnessForm.healthDetails.trim().length < 5) {
                alert("Validation Error: 'Health Conditions & Notes' must be at least 5 characters long for professional clarity.");
                return;
            }

            if (/\d/.test(fitnessForm.allergies)) {
                alert("Validation Error: The 'Allergies' field must only contain descriptive text. Please remove any numbers.");
                return;
            }

            if (/\d/.test(fitnessForm.healthDetails)) {
                alert("Validation Error: 'Health Conditions & Notes' should be descriptive text only. Please remove any numbers.");
                return;
            }

            const dataToSync = {
                memberId: editingMember.id,
                age: fitnessForm.age === '' ? null : parseInt(fitnessForm.age),
                height: fitnessForm.height === '' ? null : parseFloat(fitnessForm.height),
                weight: fitnessForm.weight === '' ? null : parseFloat(fitnessForm.weight),
                gender: fitnessForm.gender,
                phoneNumber: fitnessForm.phoneNumber,
                fitnessGoal: fitnessForm.fitnessGoal,
                allergies: fitnessForm.allergies,
                chest: fitnessForm.chest === '' ? null : parseFloat(fitnessForm.chest),
                waist: fitnessForm.waist === '' ? null : parseFloat(fitnessForm.waist),
                biceps: fitnessForm.biceps === '' ? null : parseFloat(fitnessForm.biceps),
                thighs: fitnessForm.thighs === '' ? null : parseFloat(fitnessForm.thighs),
                healthDetails: fitnessForm.healthDetails
            };

            await axios.post(`http://localhost:8080/api/trainer/update-member-fitness`, dataToSync, {
                headers: { Authorization: auth }
            });
            alert("Athlete fitness profile synchronized successfully!");
            setEditingMember(null);
            fetchMembers();
        } catch (err) {
            console.error("DEBUG - Sync Error:", err);
            const serverMsg = err.response?.data || err.message;
            alert("Sync Failed: " + serverMsg);
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <TrainerSidebar activePage="members" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <TrainerHeader title="" subtitle="Empowering trainers to optimize athlete performance data." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Member Health & Fitness</h2>
                                <p className="text-slate-300 font-medium">Keep track of your athletes' parameters.</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search members..." 
                                    className="pl-12 pr-6 py-3 rounded-2xl bg-white/10 text-white placeholder-slate-400 border border-white/20 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/50 w-64 font-medium backdrop-blur-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {members.filter(m => 
                            m.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.email.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((member, i) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                            >
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center font-black text-2xl">
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{member.username}</h3>
                                        <p className="text-slate-400 text-sm font-medium">{member.email}</p>
                                    </div>
                                    <div className="ml-auto flex flex-col gap-2">
                                        <button onClick={() => openEdit(member)} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all text-sm w-full justify-center">
                                            <ExternalLink size={16} /> Update Data
                                        </button>
                                        <button onClick={() => fetchMemberProgress(member)} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all text-sm w-full justify-center shadow-lg shadow-blue-500/20">
                                            <TrendingUp size={16} /> View Progress
                                        </button>
                                        <button onClick={() => openMessageModal(member)} className="bg-slate-100 text-slate-900 px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-all text-sm w-full justify-center border border-slate-200">
                                            <Send size={16} /> Send Message
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Weight</p>
                                        <p className="text-lg font-black text-slate-900">{member.weight || '--'} kg</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Height</p>
                                        <p className="text-lg font-black text-slate-900">{member.height || '--'} cm</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Age</p>
                                        <p className="text-lg font-black text-slate-900">{member.age || '--'} yrs</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 flex items-center gap-3">
                                        <UserIcon size={18} className="text-emerald-600" />
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase">Gender</p>
                                            <p className="text-sm font-black text-slate-900">{member.gender || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50 flex items-center gap-3">
                                        <Phone size={18} className="text-blue-600" />
                                        <div>
                                            <p className="text-[10px] font-black text-blue-600 uppercase">Phone</p>
                                            <p className="text-sm font-black text-slate-900">{member.phoneNumber || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100/50 flex items-center gap-3">
                                        <Activity size={18} className="text-purple-600" />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-purple-600 uppercase">Fitness Goal</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{member.fitnessGoal || 'Not set'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100/50 flex items-center gap-3">
                                        <X size={18} className="text-red-600" />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-red-600 uppercase">Allergies</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{member.allergies || 'None'}</p>
                                        </div>
                                    </div>
                                </div>

                                {member.healthDetails && (
                                    <div className="mt-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/30">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FileText size={12} /> Technical Health Context
                                        </p>
                                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{member.healthDetails}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {editingMember && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide"
                            >
                                <button 
                                    onClick={() => setEditingMember(null)} 
                                    className="absolute right-8 top-8 text-slate-400 hover:text-slate-900 transition-colors p-2 bg-slate-50 rounded-full"
                                >
                                    <X size={24} />
                                </button>
                                
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
                                        {editingMember.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900">Update Fitness Data</h2>
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Optimizing {editingMember.username}'s Profile</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Age</label>
                                            <div className="relative">
                                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="number" value={fitnessForm.age} onChange={e => setFitnessForm({ ...fitnessForm, age: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Height (cm)</label>
                                            <div className="relative">
                                                <Ruler size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="number" value={fitnessForm.height} onChange={e => setFitnessForm({ ...fitnessForm, height: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Weight (kg)</label>
                                        <div className="relative">
                                            <Weight size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input type="number" value={fitnessForm.weight} onChange={e => setFitnessForm({ ...fitnessForm, weight: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Gender</label>
                                            <div className="relative">
                                                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <select value={fitnessForm.gender} disabled className="w-full bg-slate-100 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none cursor-not-allowed text-slate-500 appearance-none">
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Phone Number</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="text" value={fitnessForm.phoneNumber} disabled className="w-full bg-slate-100 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none cursor-not-allowed text-slate-500" placeholder="e.g. 0771234567" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Fitness Goal</label>
                                            <div className="relative">
                                                <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <select value={fitnessForm.fitnessGoal} onChange={e => setFitnessForm({ ...fitnessForm, fitnessGoal: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none">
                                                    <option value="">Select Goal</option>
                                                    <option value="Weight Loss">Weight Loss</option>
                                                    <option value="Weight Gain">Weight Gain</option>
                                                    <option value="Muscle Building">Muscle Building</option>
                                                    <option value="Endurance Training">Endurance Training</option>
                                                    <option value="Flexibility">Flexibility / Yoga</option>
                                                    <option value="Body Transformation">General Body Transformation</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Allergies</label>
                                            <div className="relative">
                                                <X size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="text" value={fitnessForm.allergies} onChange={e => setFitnessForm({ ...fitnessForm, allergies: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. Peanuts, Gluten" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Chest (Inches)</label>
                                            <div className="relative">
                                                <Box size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="number" value={fitnessForm.chest} onChange={e => setFitnessForm({ ...fitnessForm, chest: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Waist (Inches)</label>
                                            <div className="relative">
                                                <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="number" value={fitnessForm.waist} onChange={e => setFitnessForm({ ...fitnessForm, waist: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Biceps (Inches)</label>
                                            <div className="relative">
                                                <TrendingUp size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="number" value={fitnessForm.biceps} onChange={e => setFitnessForm({ ...fitnessForm, biceps: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400">Thighs (Inches)</label>
                                            <div className="relative">
                                                <Weight size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="number" value={fitnessForm.thighs} onChange={e => setFitnessForm({ ...fitnessForm, thighs: e.target.value })} className="w-full bg-slate-50 p-4 pl-12 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Health Conditions & Notes</label>
                                        <textarea value={fitnessForm.healthDetails} onChange={e => setFitnessForm({ ...fitnessForm, healthDetails: e.target.value })} className="w-full bg-slate-50 p-6 rounded-[2rem] border border-slate-100 font-bold outline-none h-32" placeholder="e.g. Asthma, Knee Injury..."></textarea>
                                    </div>

                                    <button className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all">
                                        <Save size={24} /> Sync Health Data
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {showProgressModal && selectedMemberProgress && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl text-slate-900">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-4xl rounded-[3rem] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide"
                            >
                                <button 
                                    onClick={() => setShowProgressModal(false)} 
                                    className="absolute right-8 top-8 text-slate-400 hover:text-slate-900 transition-colors p-2 bg-slate-50 rounded-full"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex items-center gap-6 mb-10">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
                                        {selectedMemberProgress.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900">{selectedMemberProgress.username}'s Progress</h2>
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Real-time transformation metrics</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-slate-900">Weight Journey</h3>
                                            <Activity size={20} className="text-blue-500" />
                                        </div>
                                        <SimpleChart 
                                            data={progressData.map(l => l.weight)} 
                                            dates={progressData.map(l => l.logDate)} 
                                            color="#3b82f6" 
                                            id="weight" 
                                        />
                                        <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase">
                                            <span>Baseline</span>
                                            <span>Latest: {progressData.length > 0 ? progressData[progressData.length-1].weight : '0'} kg</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-slate-900">BMI Transition</h3>
                                            <TrendingUp size={20} className="text-emerald-500" />
                                        </div>
                                        <SimpleChart 
                                            data={progressData.map(l => l.bmi)} 
                                            dates={progressData.map(l => l.logDate)} 
                                            color="#10b981" 
                                            id="bmi" 
                                        />
                                        <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase">
                                            <span>Baseline</span>
                                            <span>Latest: {progressData.length > 0 ? progressData[progressData.length-1].bmi.toFixed(1) : '0'} BMI</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid md:grid-cols-2 gap-8 items-center bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                            <Activity size={20} className="text-emerald-400" /> Transformation Radar
                                        </h3>
                                        <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                                            Visualize structural muscle development balance for {selectedMemberProgress.username}.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Chest</p>
                                                <p className="text-sm font-black">{progressData.length > 0 ? progressData[progressData.length-1].chest || 0 : 0}"</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Waist</p>
                                                <p className="text-sm font-black">{progressData.length > 0 ? progressData[progressData.length-1].waist || 0 : 0}"</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Biceps</p>
                                                <p className="text-sm font-black">{progressData.length > 0 ? progressData[progressData.length-1].biceps || 0 : 0}"</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Thighs</p>
                                                <p className="text-sm font-black">{progressData.length > 0 ? progressData[progressData.length-1].thighs || 0 : 0}"</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center flex-1">
                                        <RadarChart data={progressData} />
                                    </div>
                                </div>

                                <div className="mt-8 bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                    <div className="flex justify-between items-center mb-6 px-2">
                                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <Calendar size={20} className="text-blue-500" /> Recent Activity Log
                                        </h3>
                                        <div className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Weekly Stats: {workoutPerformance?.consistencyPercentage?.toFixed(0) || 0}% Consistent
                                        </div>
                                    </div>
                                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="bg-slate-900 text-white">
                                                    <th className="px-6 py-4 font-black uppercase tracking-widest">Date</th>
                                                    <th className="px-6 py-4 font-black uppercase tracking-widest">Protocol Name</th>
                                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-right">Completion</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {workoutPerformance?.logs?.length > 0 ? (
                                                    workoutPerformance.logs.slice(0, 5).map((log, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-slate-600">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                                            <td className="px-6 py-4 font-black text-slate-900">{log.planName || 'Standard Routine'}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className={`font-black ${log.completionPercentage >= 80 ? 'text-emerald-500' : log.completionPercentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                                    {log.completionPercentage.toFixed(0)}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-bold italic">No recent workout activity logged.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                                    <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Current Height</p>
                                        <p className="text-2xl font-black text-slate-900">{selectedMemberProgress.height || 'N/A'} cm</p>
                                    </div>
                                    <div className="flex-1 bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                        <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Target Status</p>
                                        <p className="text-2xl font-black text-emerald-600">ACTIVE</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {showMessageModal && selectedMemberForMsg && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl"
                            >
                                <button 
                                    onClick={() => setShowMessageModal(false)} 
                                    className="absolute right-8 top-8 text-slate-400 hover:text-slate-900 transition-colors p-2 bg-slate-50 rounded-full"
                                >
                                    <X size={24} />
                                </button>
                                
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
                                        <Activity size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900">Send Advisory</h2>
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Direct Message to {selectedMemberForMsg.username}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Your Message (Min 10 Characters)</label>
                                        <textarea 
                                            value={messageText} 
                                            onChange={e => setMessageText(e.target.value)} 
                                            className="w-full bg-slate-50 p-6 rounded-[2rem] border border-slate-100 font-bold outline-none h-48 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                            placeholder="Provide technical feedback, nutritional guidance, or performance motivation..."
                                        ></textarea>
                                        <div className="flex justify-between px-1">
                                            <p className={`text-[10px] font-black uppercase ${messageText.length < 10 ? 'text-red-400' : 'text-emerald-500'}`}>
                                                Characters: {messageText.length} / 10 Min
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleSendMessage}
                                        className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-blue-500/10"
                                    >
                                        <Save size={24} /> Dispatch Message
                                    </button>
                                </div>
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

export default MyMembers;

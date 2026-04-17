import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MemberSidebar from '../components/MemberSidebar';
import { Calendar, User, MessageCircle, Clock, MapPin, ChevronRight, CheckCircle, Search, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';

const TrainerSessions = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'browse', 'slots'
    const [trainerName, setTrainerName] = useState(null);
    const [trainerId, setTrainerId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewNotes, setViewNotes] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const navigate = useNavigate();

    const auth = JSON.parse(localStorage.getItem('auth'));

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [pRes, sRes] = await Promise.all([
                axios.get('http://localhost:8080/api/member/profile', { headers: { Authorization: auth } }),
                axios.get('http://localhost:8080/api/member/sessions', { headers: { Authorization: auth } })
            ]);

            if (pRes.data.membershipStatus !== 'ACTIVE') {
                navigate('/member/membership');
                return;
            }

            if (pRes.data.trainerName) {
                setTrainerName(pRes.data.trainerName);
                setTrainerId(pRes.data.trainerId);
            } else {
                // If no trainer assigned, fetch available ones immediately
                const tRes = await axios.get('http://localhost:8080/api/member/trainers', { headers: { Authorization: auth } });
                setTrainers(tRes.data);
            }
            setSessions(sRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBrowseTrainers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/api/member/trainers', { headers: { Authorization: auth } });
            setTrainers(res.data);
            setView('browse');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTrainerId = async (id, name) => {
        setSelectedTrainer({ id, username: name });
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/member/trainers/${id}/slots`, { headers: { Authorization: auth } });
            setSlots(res.data);
            setView('slots');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookSlot = async (slotId) => {
        if (!window.confirm("Confirm booking this slot?")) return;
        try {
            await axios.post(`http://localhost:8080/api/member/book/${slotId}`, {}, { headers: { Authorization: auth } });
            alert("Booking Successful!");
            setView('dashboard');
            fetchDashboardData();
        } catch (err) {
            const errorMsg = err.response?.data || "Booking failed. Please try again.";
            alert(typeof errorMsg === 'string' ? errorMsg : "Booking failed");
        }
    };

    const handleCancelBooking = async (sessionId) => {
        if (!window.confirm("Are you sure you want to cancel this booking? Cancellations must be made at least 10 hours before the session.")) return;
        try {
            await axios.delete(`http://localhost:8080/api/member/bookings/${sessionId}`, { headers: { Authorization: auth } });
            alert("Booking Cancelled.");
            fetchDashboardData();
        } catch (err) {
            const errorMsg = err.response?.data || "Cancellation failed.";
            alert(typeof errorMsg === 'string' ? errorMsg : "Cancellation failed");
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <MemberSidebar activePage="trainer" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">

                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <MemberHeader title="Trainer Hub" subtitle="Accelerate your progress today" lightTheme={true} />
                    </div>
                </div>
                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">


                    {view === 'dashboard' && (
                        <div className="grid lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-1 space-y-8">
                                {trainerName ? (
                                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase px-2 py-1 rounded-md">Assigned</span>
                                        </div>
                                        <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-slate-50/50 group-hover:scale-105 transition-transform">
                                            <User size={60} className="text-slate-300" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">{trainerName}</h3>
                                        <p className="text-blue-500 font-bold text-sm mb-6 tracking-widest uppercase italic border-b border-slate-50 pb-4">Personal Elite Coach</p>

                                        <div className="flex flex-col gap-3 mb-8">
                                            <button
                                                onClick={() => handleSelectTrainerId(trainerId, trainerName)}
                                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                            >
                                                <Calendar size={18} /> Book with {trainerName}
                                            </button>
                                            <button
                                                onClick={handleBrowseTrainers}
                                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-colors"
                                            >
                                                <Search size={18} /> Browse Other Trainers
                                            </button>
                                        </div>
                                        <p className="text-slate-400 text-sm italic font-medium">Reach out to your coach to discuss your progress or clarify sessions.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200 text-center">
                                        <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                                            <Sparkles size={40} className="text-blue-400 animate-pulse" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 italic">Find Your Mentor</h3>
                                        <p className="text-slate-400 font-medium text-sm mb-8 leading-relaxed">
                                            Start your fitness journey by booking a session with one of our <span className="text-blue-600 font-bold">Elite Trainers</span>.
                                        </p>
                                        <div className="space-y-3">
                                            {trainers.slice(0, 3).map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleSelectTrainerId(t.id, t.username)}
                                                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold text-sm transition-all border border-slate-100 flex items-center justify-between px-6 group"
                                                >
                                                    <span>{t.username}</span>
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                            {trainers.length > 3 && (
                                                <button
                                                    onClick={handleBrowseTrainers}
                                                    className="w-full text-blue-600 py-2 font-bold text-xs uppercase tracking-widest hover:underline"
                                                >
                                                    View all {trainers.length} Trainers
                                                </button>
                                            )}
                                            {trainers.length === 0 && (
                                                <p className="text-slate-300 text-xs italic">No trainers available right now.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl shadow-inner"></div>
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 text-slate-900 font-sans">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter uppercase italic">
                                                <Calendar className="text-blue-600" size={26} /> Weekly Schedule
                                            </h3>
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-9">Stay consistent with your goals</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto pb-3 md:pb-1.5 no-scrollbar">
                                                {(() => {
                                                    const today = new Date();
                                                    return [...Array(7)].map((_, i) => {
                                                        const date = new Date();
                                                        date.setDate(today.getDate() + i);
                                                        const dateStr = date.toISOString().split('T')[0];
                                                        const isSelected = selectedDate === dateStr;
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => setSelectedDate(dateStr)}
                                                                className={`flex flex-col items-center justify-center min-w-[50px] md:min-w-[60px] py-3 rounded-xl transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-105 z-10' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
                                                            >
                                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                                </span>
                                                                <span className="text-lg font-black leading-none mt-1">
                                                                    {date.getDate()}
                                                                </span>
                                                            </button>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                        {(() => {
                                            const filteredSessions = sessions.filter(s => s.sessionTime.startsWith(selectedDate));
                                            if (filteredSessions.length === 0) {
                                                return (
                                                    <div className="py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                                                        <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-slate-200 shadow-sm border border-slate-100">
                                                            <Sparkles size={32} />
                                                        </div>
                                                        <p className="text-slate-400 font-bold italic tracking-wide">No active bookings for this date.</p>
                                                    </div>
                                                );
                                            }
                                            return filteredSessions.sort((a,b) => new Date(a.sessionTime) - new Date(b.sessionTime)).map((s, i) => (
                                                <div key={i} className="flex flex-col md:flex-row md:justify-between md:items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group active:scale-[0.98] gap-4">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white font-black text-[10px] shadow-lg shadow-slate-900/10 group-hover:bg-blue-600 transition-colors">
                                                            <span>{formatTime(s.sessionTime).split(' ')[0]}</span>
                                                            <span className="opacity-50 mt-0.5">{formatTime(s.sessionTime).split(' ')[1]}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-xl text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors uppercase italic">{s.sessionType}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                                                <User size={10} className="text-blue-500" /> Guidance by {s.trainer?.username}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between md:flex-col items-center md:items-end gap-3">
                                                        <span className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-full border shadow-sm ${
                                                            s.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            s.status === 'MISSING' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                            {s.status}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            {s.status === 'UPCOMING' && (
                                                                <button 
                                                                    onClick={() => handleCancelBooking(s.id)}
                                                                    className="text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest border-b border-red-100 hover:border-red-500 transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                            {s.notes && (
                                                                <button 
                                                                    onClick={() => setViewNotes(s)}
                                                                    className="bg-slate-900 text-white p-2 rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-90"
                                                                >
                                                                    <MessageCircle size={14} />
                                                                </button>
                                                            )}
                                                            <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                                                <MapPin size={20} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>

                                {/* History Section */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden mt-8">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-tight">
                                        <Sparkles className="text-blue-400" size={20} /> Past Sessions & Feedback
                                    </h3>
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {sessions.filter(s => s.status !== 'UPCOMING').length === 0 ? (
                                            <p className="text-slate-500 italic text-center py-4">Your history will appear here once you complete sessions.</p>
                                        ) : (
                                            sessions.filter(s => s.status !== 'UPCOMING').sort((a,b) => new Date(b.sessionTime) - new Date(a.sessionTime)).map((s, i) => (
                                                <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                                                    <div>
                                                        <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{s.sessionType}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(s.sessionTime)} • {formatTime(s.sessionTime)}</p>
                                                    </div>
                                                    {s.notes && (
                                                        <button 
                                                            onClick={() => setViewNotes(s)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95"
                                                        >
                                                            <MessageCircle size={14} /> SEE NOTES
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'browse' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button onClick={() => setView('dashboard')} className="mb-6 text-slate-500 font-bold hover:text-slate-900 flex items-center gap-2 group transition-colors">
                                <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
                            </button>
                            <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">Select Your New Expert</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {trainers.map(trainer => (
                                    <div key={trainer.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden" onClick={() => handleSelectTrainerId(trainer.id, trainer.username)}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-900/20 group-hover:rotate-3 transition-transform">
                                                <User size={40} />
                                            </div>
                                            <h3 className="font-bold text-xl text-slate-900 mb-1">{trainer.username}</h3>
                                            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">Elite Fitness Professional</p>

                                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-500">View Availability</span>
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'slots' && selectedTrainer && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button onClick={() => setView(trainerId === selectedTrainer.id ? 'dashboard' : 'browse')} className="mb-6 text-slate-500 font-bold hover:text-slate-900 flex items-center gap-2 group transition-colors">
                                <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back
                            </button>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active Slots</span>
                                    </div>
                                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Booking Selection</h2>
                                    <p className="text-slate-500 font-medium">Available sessions with <span className="text-blue-600 font-bold">{selectedTrainer.username}</span></p>
                                </div>
                            </div>

                            {slots.length === 0 ? (
                                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <Calendar size={48} className="mx-auto text-slate-200 mb-6" />
                                    <p className="text-slate-400 font-bold text-xl mb-2">No slots currently listed.</p>
                                    <p className="text-slate-300 text-sm">Please check back later or contact your trainer directly.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {slots.map(slot => (
                                        <div key={slot.id} className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${slot.bookedCount >= slot.capacity
                                            ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                                            : 'bg-white border-slate-100 shadow-lg hover:shadow-2xl cursor-pointer hover:border-emerald-200 group'
                                            }`}>
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-1">
                                                        <Calendar size={12} /> {formatDate(slot.startTime)}
                                                    </div>
                                                    <p className="font-bold text-slate-900 text-2xl">{formatTime(slot.startTime)}</p>
                                                    <p className="text-slate-400 font-medium text-xs">Ends at {formatTime(slot.endTime)}</p>
                                                </div>
                                                {slot.bookedCount >= slot.capacity ? (
                                                    <span className="bg-red-50 text-red-500 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase">Session Full</span>
                                                ) : (
                                                    <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase">Join Session</span>
                                                )}
                                            </div>

                                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-bold text-slate-900 leading-none">{slot.capacity - slot.bookedCount}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Spots Left</span>
                                                </div>
                                                {slot.bookedCount < slot.capacity && (
                                                    <button
                                                        onClick={() => handleBookSlot(slot.id)}
                                                        className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                                    >
                                                        Confirm Booking
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <AnimatePresence>
                        {viewNotes && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 relative shadow-2xl border border-white/10"
                                >
                                    <button 
                                        onClick={() => setViewNotes(null)} 
                                        className="absolute right-8 top-8 text-slate-500 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                                            <MessageCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Trainer Feedback</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">From Coach {viewNotes.trainer?.username}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 mb-8">
                                        <p className="text-blue-100 text-lg font-medium leading-relaxed italic">
                                            "{viewNotes.notes}"
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setViewNotes(null)}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
                                    >
                                        Close Feedback
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center relative z-20">
                    <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 border-b border-slate-800 pb-8">
                        <div className="flex flex-col gap-4 max-w-[200px]">
                            <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                                <div className="text-white bg-blue-600 p-1 rounded min-w-[32px] min-h-[32px] flex items-center justify-center font-bold">MH</div> MUSCLEHUB
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-500">Premium Fitness Management</p>
                        </div>
                        <div className="flex flex-1 justify-around gap-4 text-[11px]">
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">About Us</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>Our gym's vision, story & core mission.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Services</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>AI plans, top-tier trainers & facilities.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Contact</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>24/7 dedicated support & inquiry line.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Privacy Policy</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>Data security, user safety & terms.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-slate-400">FB</button>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors text-slate-400">TW</button>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors text-slate-400">IG</button>
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

export default TrainerSessions;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MemberSidebar from '../components/MemberSidebar';
import MemberHeader from '../components/MemberHeader';
import MemberPageBanner from '../components/MemberPageBanner';
import { Calendar, User, MessageCircle, Clock, MapPin, ChevronRight, CheckCircle, Search, Sparkles, AlertCircle, X } from 'lucide-react';

const TrainerSessions = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'browse', 'slots'
    const [trainerName, setTrainerName] = useState(null);
    const [trainerId, setTrainerId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [sessionToCancel, setSessionToCancel] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const initiateCancel = (sessionId) => {
        setSessionToCancel(sessionId);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        if (!sessionToCancel) return;

        try {
            await axios.delete(`http://localhost:8080/api/member/sessions/${sessionToCancel}`, { headers: { Authorization: auth } });
            setNotification({ show: true, message: 'Appointment cancelled successfully!', type: 'success' });
            fetchDashboardData();
        } catch (err) {
            const errorMsg = err.response?.data || "Cancellation failed. Please try again.";
            setNotification({ show: true, message: typeof errorMsg === 'string' ? errorMsg : "Cancellation failed", type: 'error' });
        } finally {
            setShowCancelModal(false);
            setSessionToCancel(null);
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
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
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100">
            <MemberSidebar activePage="trainer" />
            <main className="ml-64 flex-1 p-6">
                <MemberPageBanner title="Trainer Hub" subtitle="Book sessions and manage your training schedule" icon={Calendar} />

                {view === 'dashboard' && (
                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 space-y-8">
                            {trainerName ? (
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase px-2 py-1 rounded-md">Assigned</span>
                                    </div>
                                    <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-slate-50/50 group-hover:scale-105 transition-transform">
                                        <User size={60} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{trainerName}</h3>
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
                                    <h3 className="text-xl font-black text-slate-900 mb-2 italic">Find Your Mentor</h3>
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
                                                className="w-full text-blue-600 py-2 font-black text-xs uppercase tracking-widest hover:underline"
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
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Sparkles size={120} />
                                </div>
                                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                    <Calendar className="text-blue-400" size={24} /> My Training Schedule
                                </h3>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                    {sessions.length === 0 ? (
                                        <div className="py-12 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
                                            <p className="text-slate-500 italic font-medium">No sessions scheduled yet.</p>
                                        </div>
                                    ) : sessions.map((s, i) => (
                                        <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                                            <div>
                                                <p className="font-bold text-lg text-white">{s.sessionType}</p>
                                                <p className="text-xs text-blue-400 font-black uppercase tracking-widest mb-2">with {s.trainer?.username}</p>
                                                <div className="flex items-center gap-4 text-slate-400 text-xs font-medium">
                                                    <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(s.sessionTime)}</span>
                                                    <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(s.sessionTime)}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${s.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    s.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                    {s.status}
                                                </span>
                                                {s.status === 'UPCOMING' && (
                                                    <button
                                                        onClick={() => initiateCancel(s.id)}
                                                        className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <div className="text-blue-400 group-hover:scale-110 transition-transform mt-1">
                                                    <MapPin size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Select Your New Expert</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {trainers.map(trainer => (
                                <div key={trainer.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden" onClick={() => handleSelectTrainerId(trainer.id, trainer.username)}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                    <div className="relative z-10">
                                        <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-900/20 group-hover:rotate-3 transition-transform">
                                            <User size={40} />
                                        </div>
                                        <h3 className="font-black text-xl text-slate-900 mb-1">{trainer.username}</h3>
                                        <p className="text-blue-600 text-xs font-black uppercase tracking-widest mb-6">Elite Fitness Professional</p>

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
                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Active Slots</span>
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Booking Selection</h2>
                                <p className="text-slate-500 font-medium">Available sessions with <span className="text-blue-600 font-black">{selectedTrainer.username}</span></p>
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
                                                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase mb-1">
                                                    <Calendar size={12} /> {formatDate(slot.startTime)}
                                                </div>
                                                <p className="font-black text-slate-900 text-2xl">{formatTime(slot.startTime)}</p>
                                                <p className="text-slate-400 font-medium text-xs">Ends at {formatTime(slot.endTime)}</p>
                                            </div>
                                            {slot.bookedCount >= slot.capacity ? (
                                                <span className="bg-red-50 text-red-500 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">Session Full</span>
                                            ) : (
                                                <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">Join Session</span>
                                            )}
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black text-slate-900 leading-none">{slot.capacity - slot.bookedCount}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Spots Left</span>
                                            </div>
                                            {slot.bookedCount < slot.capacity && (
                                                <button
                                                    onClick={() => handleBookSlot(slot.id)}
                                                    className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
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

                {showCancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}></div>
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Cancel Session?</h3>
                            <p className="text-slate-500 text-center mb-8 font-medium">
                                Are you sure you want to cancel this appointment?
                                <br /><span className="text-red-500 text-xs font-bold uppercase tracking-wide mt-2 block">Note: You can only cancel up to 1 hour before start time.</span>
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    Keep It
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="py-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {notification.show && (
                    <div className={`fixed bottom-8 right-8 p-6 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5 duration-300 ${notification.type === 'success' ? 'bg-white text-emerald-900 border-l-4 border-emerald-500' : 'bg-white text-red-900 border-l-4 border-red-500'
                        }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wide opacity-50">{notification.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="font-bold">{notification.message}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TrainerSessions;

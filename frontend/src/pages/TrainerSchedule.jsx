import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import TrainerHeader from '../components/TrainerHeader';
import { Calendar, Clock, MapPin, Users as UsersIcon, Plus, CheckCircle, X, Trash2, Box, Facebook, Twitter, Instagram, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import axios from 'axios';

const TrainerSchedule = () => {
    const [slots, setSlots] = useState([]);
    const [allSlots, setAllSlots] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [completingSession, setCompletingSession] = useState(null);
    const [attendanceForm, setAttendanceForm] = useState({ status: 'COMPLETED', notes: '' });
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const getLocalDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const [selectedDate, setSelectedDate] = useState(getLocalDate());

    const [newSlot, setNewSlot] = useState({
        date: '',
        startTime: '',
        endTime: '',
        capacity: 5
    });

    const fetchData = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const [slotRes, sessRes, allSlotRes] = await Promise.all([
                axios.get('http://localhost:8080/api/trainer/slots', { headers: { Authorization: auth } }),
                axios.get('http://localhost:8080/api/trainer/sessions', { headers: { Authorization: auth } }),
                axios.get('http://localhost:8080/api/trainer/all-slots', { headers: { Authorization: auth } })
            ]);
            setSlots(slotRes.data);
            setSessions(sessRes.data);
            setAllSlots(allSlotRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSlot = async (e) => {
        e.preventDefault();
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (newSlot.endTime <= newSlot.startTime) {
                alert("End time must be after start time.");
                return;
            }

            const startStr = `${newSlot.date}T${newSlot.startTime}:00`;
            const endStr = `${newSlot.date}T${newSlot.endTime}:00`;

            await axios.post('http://localhost:8080/api/trainer/slots', {
                start: startStr,
                end: endStr,
                capacity: newSlot.capacity
            }, {
                headers: { Authorization: auth }
            });
            setShowForm(false);
            setNewSlot({ date: '', startTime: '', endTime: '', capacity: 5 });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to add slot. Please check your inputs.");
        }
    };

    const handleCompleteSession = async (e) => {
        e.preventDefault();
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/trainer/sessions/${completingSession.id}/complete`, {
                status: attendanceForm.status,
                notes: attendanceForm.notes
            }, {
                headers: { Authorization: auth }
            });
            setCompletingSession(null);
            setAttendanceForm({ status: 'COMPLETED', notes: '' });
            fetchData();
        } catch (err) {
            alert("Update failed");
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slot? If someone has already booked, it cannot be deleted.")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/trainer/slots/${id}`, {
                headers: { Authorization: auth }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data || "Delete failed");
        }
    };

    const handleUpdateSlot = async (e) => {
        e.preventDefault();
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (editingSlot.endTime <= editingSlot.startTime) {
                alert("End time must be after start time.");
                return;
            }

            const startStr = `${editingSlot.date}T${editingSlot.startTime}:00`;
            const endStr = `${editingSlot.date}T${editingSlot.endTime}:00`;

            await axios.put(`http://localhost:8080/api/trainer/slots/${editingSlot.id}`, {
                start: startStr,
                end: endStr,
                capacity: editingSlot.capacity
            }, {
                headers: { Authorization: auth }
            });
            setEditingSlot(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data || "Update failed");
        }
    };

    const openEditSlot = (slot) => {
        const start = new Date(slot.startTime);
        const end = new Date(slot.endTime);
        const datePart = slot.startTime.split('T')[0];
        const startParts = start.toTimeString().split(' ')[0].split(':');
        const endParts = end.toTimeString().split(' ')[0].split(':');
        
        setEditingSlot({
            id: slot.id,
            date: datePart,
            startTime: `${startParts[0]}:${startParts[1]}`,
            endTime: `${endParts[0]}:${endParts[1]}`,
            capacity: slot.capacity,
            bookedCount: slot.bookedCount
        });
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <TrainerSidebar activePage="schedule" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <TrainerHeader title="" subtitle="Plan your teaching time efficiently." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">My Availability</h2>
                                <p className="text-slate-300 font-medium">Manage your time slots and view bookings.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-emerald-500/20"
                                >
                                    <Plus size={20} /> Add Time Slot
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">

                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative"
                            >
                                <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                                    <X size={24} />
                                </button>
                                <h2 className="text-2xl font-black text-slate-900 mb-8 font-display">Add Availability</h2>
                                <form onSubmit={handleAddSlot} className="space-y-6">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Select Date</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={newSlot.date}
                                                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={newSlot.startTime}
                                                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">End Time</label>
                                                <input
                                                    type="time"
                                                    value={newSlot.endTime}
                                                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Max Capacity (Max 8)</label>
                                        <input
                                            type="number"
                                            value={newSlot.capacity}
                                            onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                            min="1"
                                            max="8"
                                            required
                                        />
                                    </div>
                                    <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all">Create Slot</button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {editingSlot && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative"
                            >
                                <button onClick={() => setEditingSlot(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                                    <X size={24} />
                                </button>
                                <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">Modify Time Slot</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                                    {editingSlot.bookedCount > 0 ? "⚠️ Some spots booked - Time is locked" : "Free to adjust all parameters"}
                                </p>

                                <form onSubmit={handleUpdateSlot} className="space-y-6">
                                    <div className={`space-y-6 ${editingSlot.bookedCount > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div>
                                            <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Slot Date</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={editingSlot.date}
                                                onChange={(e) => setEditingSlot({ ...editingSlot, date: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Start</label>
                                                <input
                                                    type="time"
                                                    value={editingSlot.startTime}
                                                    onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">End</label>
                                                <input
                                                    type="time"
                                                    value={editingSlot.endTime}
                                                    onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Attendee Capacity</label>
                                        <input
                                            type="number"
                                            value={editingSlot.capacity}
                                            onChange={(e) => setEditingSlot({ ...editingSlot, capacity: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                            min={editingSlot.bookedCount || 1}
                                            required
                                        />
                                    </div>
                                    <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all">Save Changes</button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {completingSession && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative"
                            >
                                <button onClick={() => setCompletingSession(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                                    <X size={24} />
                                </button>
                                <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">Mark Attendance</h2>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
                                    Update session status for <span className="text-blue-600">{completingSession.member?.username}</span>
                                </p>

                                <form onSubmit={handleCompleteSession} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Session Status</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => setAttendanceForm({...attendanceForm, status: 'COMPLETED'})}
                                                className={`py-4 rounded-xl font-bold border transition-all ${attendanceForm.status === 'COMPLETED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                            >
                                                Completed
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setAttendanceForm({...attendanceForm, status: 'MISSING'})}
                                                className={`py-4 rounded-xl font-bold border transition-all ${attendanceForm.status === 'MISSING' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                            >
                                                Absent
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Feedback & Notes</label>
                                        <textarea 
                                            value={attendanceForm.notes}
                                            onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})}
                                            placeholder="Write some feedback for the member..."
                                            className="w-full p-6 rounded-[2rem] bg-slate-50 border border-slate-100 outline-none h-32 font-bold"
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-600 transition-all">
                                        Update Session status
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-12">
                    {/* Date Selector Header */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                            <button 
                                onClick={() => {
                                    const d = new Date(selectedDate);
                                    d.setDate(d.getDate() - 1);
                                    setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-900"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="px-6 py-1 text-center min-w-[180px]">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5 flex items-center justify-center gap-1">
                                    Focus Date {selectedDate === getLocalDate() && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                                </p>
                                <p className="text-lg font-black text-slate-900 leading-none">
                                    {selectedDate === getLocalDate() ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    const d = new Date(selectedDate);
                                    d.setDate(d.getDate() + 1);
                                    setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-900"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {selectedDate !== getLocalDate() && (
                            <button
                                onClick={() => setSelectedDate(getLocalDate())}
                                className="px-5 py-2 bg-blue-600/10 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                            >
                                <Calendar size={14} /> Back to Today
                            </button>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block border-r border-slate-100 pr-4 mr-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Slots</p>
                                <p className="text-sm font-black text-slate-900">{slots.filter(s => s.startTime.startsWith(selectedDate)).length} Slots Today</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setNewSlot({...newSlot, date: selectedDate});
                                    setShowForm(true);
                                }}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-black transition-all shadow-lg flex items-center gap-2"
                            >
                                <Plus size={16} /> New Slot
                            </button>
                        </div>
                    </div>

                    {/* Today's Time Slots Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <Clock size={18} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Available Time Slots</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {slots.filter(slot => slot.startTime.startsWith(selectedDate)).length === 0 ? (
                                <div className="col-span-full py-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                                    <p className="text-slate-400 font-bold italic">No time slots created for this date.</p>
                                </div>
                            ) : (
                                slots
                                    .filter(slot => slot.startTime.startsWith(selectedDate))
                                    .sort((a,b) => new Date(a.startTime) - new Date(b.startTime))
                                    .map(slot => (
                                        <div key={slot.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    Slot
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => openEditSlot(slot)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                                        <Plus className="rotate-45" size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteSlot(slot.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-lg font-black text-slate-900 mb-1">
                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                            </p>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Booked: {slot.bookedCount}/{slot.capacity}</span>
                                                <div className="flex-1 max-w-[60px] h-1 bg-slate-100 rounded-full ml-3 overflow-hidden">
                                                    <div className="bg-blue-600 h-full transition-all" style={{ width: `${(slot.bookedCount / slot.capacity) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>

                    {/* Today's Full Schedule Table */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                                <List size={18} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Today's Detailed Sessions</h3>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200">Session Interval</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200">Athlete Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200">Logistics</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.filter(s => s.sessionTime.startsWith(selectedDate)).length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                        <Box size={32} />
                                                    </div>
                                                    <p className="text-slate-400 font-bold italic tracking-wide">No active bookings for the selected date.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sessions
                                            .filter(s => s.sessionTime.startsWith(selectedDate))
                                            .sort((a,b) => new Date(a.sessionTime) - new Date(b.sessionTime))
                                            .map((s) => (
                                                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-8 py-6 border-r border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            <div>
                                                                <p className="font-black text-slate-900 leading-none mb-1">{formatTime(s.sessionTime)}</p>
                                                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{s.sessionType || 'GENERAL'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 border-r border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                                                                {s.member?.username?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 leading-none mb-1">{s.member?.username}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Certified Athlete</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 border-r border-slate-100">
                                                        <div className="flex items-center gap-3 font-bold text-sm">
                                                            <MapPin size={14} className="text-slate-300" />
                                                            {s.venue || 'Premium Training Floor'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 border-r border-slate-100">
                                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase border shadow-sm ${
                                                            s.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                            s.status === 'MISSING' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                            'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {s.status !== 'COMPLETED' && s.status !== 'MISSING' ? (
                                                            <button 
                                                                onClick={() => setCompletingSession(s)}
                                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-black transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                                                            >
                                                                <CheckCircle size={14} /> MARK ACTION
                                                            </button>
                                                        ) : (
                                                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic pr-4">Logged</p>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                </div>

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

export default TrainerSchedule;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import { Calendar, Clock, MapPin, Users as UsersIcon, Plus, CheckCircle, X, Trash2, ClipboardList } from 'lucide-react';
import axios from 'axios';
import TrainerPageBanner from '../components/TrainerPageBanner';

const TrainerSchedule = () => {
    const [slots, setSlots] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [newSlot, setNewSlot] = useState({
        start: '',
        end: '',
        capacity: 5
    });

    const fetchData = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const [slotRes, sessRes] = await Promise.all([
                axios.get('http://localhost:8080/api/trainer/slots', { headers: { Authorization: auth } }),
                axios.get('http://localhost:8080/api/trainer/sessions', { headers: { Authorization: auth } })
            ]);
            setSlots(slotRes.data);
            setSessions(sessRes.data);
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
            await axios.post('http://localhost:8080/api/trainer/slots', {
                start: new Date(newSlot.start).toISOString().split('.')[0],
                end: new Date(newSlot.end).toISOString().split('.')[0],
                capacity: newSlot.capacity
            }, {
                headers: { Authorization: auth }
            });
            setShowForm(false);
            setNewSlot({ start: '', end: '', capacity: 5 });
            fetchData();
        } catch (err) {
            alert("Failed to add slot");
        }
    };

    const markCompleted = async (id) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.put(`http://localhost:8080/api/trainer/sessions/${id}/complete`, {}, {
                headers: { Authorization: auth }
            });
            fetchData();
        } catch (err) {
            alert("Update failed");
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-100 to-slate-100">
            <TrainerSidebar activePage="schedule" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <TrainerPageBanner title="My Availability" subtitle="Manage your time slots and view bookings." icon={ClipboardList} />

                <div className="mb-8 flex justify-end">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-emerald-500/20"
                    >
                        <Plus size={20} /> Add Time Slot
                    </button>
                </div>

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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Start Time</label>
                                            <input
                                                type="datetime-local"
                                                value={newSlot.start}
                                                onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">End Time</label>
                                            <input
                                                type="datetime-local"
                                                value={newSlot.end}
                                                onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Max Capacity</label>
                                        <input
                                            type="number"
                                            value={newSlot.capacity}
                                            onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all">Create Slot</button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 mb-4">Upcoming Sessions (Bookings)</h3>
                            {sessions.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">No sessions marked yet.</p>
                                </div>
                            ) : sessions.map((item, i) => (
                                <div key={item.id} className="mb-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{item.member?.username}</p>
                                            <p className="text-xs text-slate-500">{formatDate(item.sessionTime)} at {formatTime(item.sessionTime)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {item.status}
                                        </span>
                                        {item.status !== 'COMPLETED' && (
                                            <button onClick={() => markCompleted(item.id)} className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                                                <CheckCircle size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-slate-900 mb-4">My Slots</h3>
                            {slots.length === 0 ? (
                                <p className="text-slate-400">No slots created.</p>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {slots.map(slot => (
                                        <div key={slot.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-lg font-black text-slate-900">{formatDate(slot.startTime)}</p>
                                                    <p className="text-slate-500 text-sm font-bold">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${slot.bookedCount >= slot.capacity ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {slot.bookedCount >= slot.capacity ? 'FULL' : 'AVAILABLE'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-emerald-500 h-full transition-all"
                                                    style={{ width: `${(slot.bookedCount / slot.capacity) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                                                <span>{slot.bookedCount} Booked</span>
                                                <span>{slot.capacity} Total</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-6">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                                    <p className="text-slate-400 text-xs font-bold uppercase">Total Slots</p>
                                    <p className="text-2xl font-black">{slots.length}</p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                                    <p className="text-slate-400 text-xs font-bold uppercase">Total Bookings</p>
                                    <p className="text-2xl font-black">{sessions.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TrainerSchedule;

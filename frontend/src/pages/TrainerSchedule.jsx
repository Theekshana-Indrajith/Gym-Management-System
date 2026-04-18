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
    const [calendarMonth, setCalendarMonth] = useState(new Date(getLocalDate()));

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
            const startStr = `${newSlot.date}T${newSlot.startTime}:00`;
            let endStr = `${newSlot.date}T${newSlot.endTime}:00`;

            const startDateTime = new Date(startStr);
            let endDateTime = new Date(endStr);
            
            // SMART LOGIC: Handle midnight cross-over (e.g. 23:00 to 01:00)
            if (newSlot.endTime <= newSlot.startTime) {
                const endHour = parseInt(newSlot.endTime.split(':')[0], 10);
                // Gym closes at 01:00 AM. Only 00:xx and 01:xx can be next-day end times.
                if (endHour <= 1) { 
                    endDateTime.setDate(endDateTime.getDate() + 1);
                    // Format correctly back to local string to avoid UTC offset issues
                    const nextDayStr = new Date(endDateTime.getTime() - (endDateTime.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    endStr = `${nextDayStr}T${newSlot.endTime}:00`;
                } else {
                    alert("Operation Prevented: End Time must be properly structured after Start Time.");
                    return;
                }
            }

            const now = new Date();
            const diffHoursFromNow = (startDateTime - now) / (1000 * 60 * 60);
            const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);

            if (diffHoursFromNow < 4) {
                alert("Operation Prevented: Slots must be scheduled at least 4 hours in advance to maintain service quality.");
                return;
            }

            if (diffHoursFromNow > 21 * 24) {
                alert("Operation Prevented: Slots cannot be scheduled more than 3 weeks (21 days) in advance.");
                return;
            }

            if (durationHours > 4) {
                alert("Operation Prevented: Maximum slot duration is limited to 4 hours to ensure rotation efficiency.");
                return;
            }

            if (durationHours < 1) {
                alert("Operation Prevented: Minimum slot duration is 1 hour to ensure substantive training sessions.");
                return;
            }

            if (newSlot.capacity > 8) {
                alert("Operation Prevented: Maximum capacity is limited to 8 members per slot to maintain instructional quality.");
                return;
            }

            // Gym Hours Validation: 5 AM to 1 AM (Closed 1 AM - 5 AM)
            const startHour = startDateTime.getHours();
            const startMin = startDateTime.getMinutes();
            const endHour = endDateTime.getHours();
            const endMin = endDateTime.getMinutes();

            const isTimeInWindow = (h, m) => {
                // Returns true if time is between 01:01 and 04:59
                if (h > 1 && h < 5) return true;
                if (h === 1 && m > 0) return true;
                return false;
            };

            // 1 AM is the hard closing limit. Start cannot be 1 AM or later if it's in the closed window.
            if (isTimeInWindow(startHour, startMin) || isTimeInWindow(endHour, endMin) || (startHour === 1 && startMin === 0)) {
                alert("Operational Protocol: The facility is closed for maintenance between 01:00 AM and 05:00 AM. Please select a valid time within 05:00 AM - 01:00 AM.");
                return;
            }

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
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to add slot. Please check your inputs.";
            alert(errorMsg);
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
            
            const startStr = `${editingSlot.date}T${editingSlot.startTime}:00`;
            let endStr = `${editingSlot.date}T${editingSlot.endTime}:00`;
            let startDateTime = new Date(startStr);
            let endDateTime = new Date(endStr);

            // SMART LOGIC: Handle midnight cross-over for updates
            if (editingSlot.endTime <= editingSlot.startTime) {
                const endHour = parseInt(editingSlot.endTime.split(':')[0], 10);
                if (endHour <= 1) { 
                    endDateTime.setDate(endDateTime.getDate() + 1);
                    const nextDayStr = new Date(endDateTime.getTime() - (endDateTime.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    endStr = `${nextDayStr}T${editingSlot.endTime}:00`;
                } else {
                    alert("Operation Prevented: End time must be properly structured after start time.");
                    return;
                }
            }

            const now = new Date();
            const diffHoursFromNow = (startDateTime - now) / (1000 * 60 * 60);

            if (diffHoursFromNow > 21 * 24) {
                alert("Operation Prevented: Slots cannot be scheduled more than 3 weeks (21 days) in advance.");
                return;
            }

            const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
            if (durationHours > 4) {
                alert("Operation Prevented: Maximum slot duration is limited to 4 hours.");
                return;
            }
            if (durationHours < 1) {
                alert("Operation Prevented: Minimum slot duration is 1 hour.");
                return;
            }

            if (editingSlot.capacity > 8) {
                alert("Operation Prevented: Maximum capacity is limited to 8 members per slot.");
                return;
            }

            await axios.put(`http://localhost:8080/api/trainer/slots/${editingSlot.id}`, {
                start: editingSlot.bookedCount > 0 ? null : startStr,
                end: editingSlot.bookedCount > 0 ? null : endStr,
                capacity: editingSlot.capacity
            }, {
                headers: { Authorization: auth }
            });

            setEditingSlot(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data || "Update failed");
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

    const getCapacityOverview = () => {
        const hourlySlots = [];
        for (let i = 5; i <= 22; i++) {
            const startHour = `${String(i).padStart(2, '0')}:00`;
            const endHour = `${String(i+1).padStart(2, '0')}:00`;
            
            const startDateTime = new Date(`${selectedDate}T${startHour}:00`);
            const endDateTime = new Date(`${selectedDate}T${endHour}:00`);

            const overlappingSlots = allSlots.filter(s => {
                const sStart = new Date(s.startTime);
                const sEnd = new Date(s.endTime);
                return sStart < endDateTime && sEnd > startDateTime;
            });

            const uniqueTrainers = new Set(overlappingSlots.map(s => s.trainerId));
            
            hourlySlots.push({
                time: `${startHour} - ${endHour}`,
                bookedTrainers: uniqueTrainers.size,
                maxCapacity: 5,
                status: uniqueTrainers.size >= 5 ? 'Fully Booked' : uniqueTrainers.size >= 4 ? 'Filling Fast' : 'Available'
            });
        }
        return hourlySlots.filter(row => row.bookedTrainers > 0);
    };

    const renderCalendar = () => {
        const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
        const lastDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
        
        let days = [];
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i));
        }

        return (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 sticky top-8 z-30 mb-8 xl:mb-0">
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => {
                            const newMonth = new Date(calendarMonth);
                            newMonth.setMonth(newMonth.getMonth() - 1);
                            setCalendarMonth(newMonth);
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter whitespace-nowrap">{calendarMonth.toLocaleString('default', { month: 'long' })} {calendarMonth.getFullYear()}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Calendar Navigation</p>
                    </div>
                    <button 
                        onClick={() => {
                            const newMonth = new Date(calendarMonth);
                            newMonth.setMonth(newMonth.getMonth() + 1);
                            setCalendarMonth(newMonth);
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                            {d}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                    {days.map((date, i) => {
                        if (!date) return <div key={`empty-${i}`} className="p-3"></div>;
                        
                        const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                        const isSelected = selectedDate === dateStr;
                        const isTodayStr = dateStr === getLocalDate();
                        const daySlots = slots.filter(s => s.startTime.startsWith(dateStr));
                        const hasSlots = daySlots.length > 0;
                        const hasBookings = daySlots.some(s => s.bookedCount > 0);
                        
                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`
                                    relative p-3 rounded-xl flex flex-col items-center justify-center transition-all w-full outline-none hover:scale-105 active:scale-95
                                    ${isSelected ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 font-black' : 'hover:bg-slate-50 text-slate-600'}
                                    ${isTodayStr && !isSelected ? 'border-2 border-blue-500 text-blue-600 font-black' : 'font-bold'}
                                `}
                            >
                                <span className={isSelected ? 'text-lg' : 'text-sm'}>{date.getDate()}</span>
                                <div className="absolute bottom-1 flex gap-1 items-center h-2">
                                    {hasSlots && !hasBookings && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`}></span>}
                                    {hasBookings && <span className={`w-1.5 h-1.5 rounded-full shadow-sm animate-pulse ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 space-y-4 pt-6 border-t border-slate-50 bg-slate-50/50 p-6 rounded-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50"></div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Active Bookings</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Available Slots</span>
                    </div>
                </div>
            </div>
        );
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
                    
                    {/* Scheduling Protocol Guidelines */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-2xl flex flex-col md:flex-row gap-8 items-center"
                    >
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 shrink-0">
                            <Clock size={40} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Scheduling Protocol</h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-4">Please adhere to the official MuscleHub trainer protocols when managing your availability to ensure a premium experience for all members.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                    Min 1 Hour Slot
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Max 4 Hour Slot
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                    Max 8 Members
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                                    4h Advance
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                                    Active: 05 AM - 01 AM
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                                    Max 3 Weeks Ahead
                                </div>
                            </div>
                        </div>
                    </motion.div>

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
                                                max={new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
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
                                                        step="900"
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
                                                        step="900"
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
                                                max={new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
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
                                                    step="900"
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
                                                    step="900"
                                                    value={editingSlot.endTime}
                                                    onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">Attendee Capacity (Up to 8)</label>
                                        <input
                                            type="number"
                                            value={editingSlot.capacity}
                                            onChange={(e) => setEditingSlot({ ...editingSlot, capacity: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                            min={editingSlot.bookedCount || 1}
                                            max="8"
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

                <div className="flex flex-col xl:flex-row gap-10 items-start">
                    
                    {/* Left Pane: Interactive Calendar */}
                    <div className="w-full xl:w-[400px] shrink-0">
                        {renderCalendar()}
                    </div>

                    {/* Right Pane: Daily Agenda */}
                    <div className="flex-1 w-full space-y-12">
                        {/* Daily Header Actions */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Calendar size={32} />
                                </div>
                                <div className="min-w-[180px]">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        FOCUS DATE {selectedDate === getLocalDate() && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                                    </p>
                                    <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                                        {selectedDate === getLocalDate() ? 'TODAY' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block border-r border-slate-100 pr-6 mr-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Slots</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{slots.filter(s => s.startTime.startsWith(selectedDate)).length} Slots Today</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setNewSlot({...newSlot, date: selectedDate});
                                        setShowForm(true);
                                    }}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 active:scale-95"
                                >
                                    <Plus size={18} /> Deploy Slot
                                </button>
                            </div>
                        </div>



                    {/* Gym Capacity Overview Table */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden"
                    >
                        <div className="bg-slate-900 px-8 py-5 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Plus size={20} className="text-emerald-500" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Gym Area Capacity Monitor</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Facility Feed</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Slot</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Capacity</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booked Trainers</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Facility Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getCapacityOverview().length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-slate-400 font-bold italic">
                                                No trainer bookings registered for the selected date. The facility has full availability.
                                            </td>
                                        </tr>
                                    ) : (
                                        getCapacityOverview().map((row, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                                                        <Clock size={14} className="text-slate-300" />
                                                        {row.time}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="text-sm font-bold text-slate-600">5 Trainers Max</span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-sm font-black ${row.bookedTrainers >= row.maxCapacity ? 'text-red-600' : 'text-slate-900'}`}>
                                                            {row.bookedTrainers}
                                                        </span>
                                                        <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-700 ${row.bookedTrainers >= 5 ? 'bg-red-500' : row.bookedTrainers >= 4 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${(row.bookedTrainers / row.maxCapacity) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                                                        row.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        row.status === 'Filling Fast' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                        {row.status === 'Available' && '✅ Available'}
                                                        {row.status === 'Filling Fast' && '⚠️ Filling Fast'}
                                                        {row.status === 'Fully Booked' && '❌ Fully Booked'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

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
                                                {slot.bookedCount > 0 ? (
                                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                        Booked
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        Slot
                                                    </div>
                                                )}
                                                <div className="flex gap-1 items-center">
                                                    {slot.bookedCount > 0 && (
                                                        <div className="mr-2 p-1.5 bg-emerald-50 text-emerald-600 rounded-lg tooltip-container relative group/lock">
                                                            <CheckCircle size={14} />
                                                            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                                                Slot active with members. Time parameters are now locked for synchronization.
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={() => openEditSlot(slot)} 
                                                        className={`p-1.5 transition-colors rounded-lg ${slot.bookedCount > 0 ? 'text-blue-500 hover:bg-blue-50' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                                                    >
                                                        <Plus className="rotate-45" size={14} />
                                                    </button>
                                                    {slot.bookedCount === 0 && (
                                                        <button onClick={() => handleDeleteSlot(slot.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
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
                                                            <div className="flex flex-col items-end gap-1">
                                                                {(() => {
                                                                    const sessionEndTime = s.endTime ? new Date(s.endTime) : new Date(new Date(s.sessionTime).getTime() + 60 * 60 * 1000);
                                                                    const isPast = new Date() >= sessionEndTime;
                                                                    
                                                                    return (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => setCompletingSession(s)}
                                                                                disabled={!isPast}
                                                                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg active:scale-95 ${
                                                                                    !isPast 
                                                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                                                                    : 'bg-emerald-600 text-white hover:bg-black shadow-emerald-600/20'
                                                                                }`}
                                                                            >
                                                                                <CheckCircle size={14} /> MARK ACTION
                                                                            </button>
                                                                            {!isPast && (
                                                                                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Available after {sessionEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
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

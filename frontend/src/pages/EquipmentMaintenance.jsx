import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { Wrench, Plus, AlertTriangle, CheckCircle, Calendar, Trash2, MapPin, Tag, Coins, BrainCircuit, Activity, X, PenTool, Box, Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';

const EquipmentMaintenance = () => {
    const [equipment, setEquipment] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [repairAsset, setRepairAsset] = useState(null);
    const [formData, setFormData] = useState({
        name: '', brand: '', serialNumber: '', location: '', cost: '', status: 'WORKING', equipmentCondition: 'EXCELLENT', nextMaintenanceDate: '', alternativeId: '', alternativeName: '', fallbackExercise: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [repairLog, setRepairLog] = useState({ action: '', notes: '', cost: '' });
    const [historyAsset, setHistoryAsset] = useState(null);
    const [historyData, setHistoryData] = useState([]);

    const fetchEquipment = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/admin/equipment', {
                headers: { Authorization: auth }
            });
            setEquipment(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (/^\d+$/.test(formData.name.trim())) {
            alert("Equipment name cannot be only numbers. Please provide a descriptive name (e.g. 'Treadmill 01').");
            return;
        }

        if (!formData.cost || parseFloat(formData.cost) <= 0) {
            alert("Please provide a valid asset cost greater than 0.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            
            // Convert empty alternativeId to null for backend Long type compatibility
            const dataToSend = {
                ...formData,
                alternativeId: formData.alternativeId === '' ? null : formData.alternativeId
            };

            if (isEditing) {
                await axios.put(`http://localhost:8080/api/admin/equipment/${formData.id}`, dataToSend, {
                    headers: { Authorization: auth }
                });
            } else {
                await axios.post('http://localhost:8080/api/admin/equipment', dataToSend, {
                    headers: { Authorization: auth }
                });
            }
            setFormData({ name: '', brand: '', serialNumber: '', location: '', cost: '', status: 'WORKING', equipmentCondition: 'EXCELLENT', nextMaintenanceDate: '', alternativeId: '', alternativeName: '', fallbackExercise: '' });
            setShowAdd(false);
            setIsEditing(false);
            fetchEquipment();
        } catch (err) {
            alert("Action failed: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (item) => {
        setFormData({ 
            ...item, 
            brand: item.brand || '',
            serialNumber: item.serialNumber || '',
            location: item.location || '',
            cost: item.cost || '',
            nextMaintenanceDate: item.nextMaintenanceDate || '',
            status: item.status || 'WORKING',
            equipmentCondition: item.equipmentCondition || 'EXCELLENT',
            alternativeId: item.alternativeId || '', 
            alternativeName: item.alternativeName || '',
            fallbackExercise: item.fallbackExercise || ''
        });
        setIsEditing(true);
        setShowAdd(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitRepair = async (e) => {
        e.preventDefault();

        // Validation for Cost
        if (repairLog.cost === '' || parseFloat(repairLog.cost) < 0) {
            alert("Please provide a valid repair cost (0 or more).");
            return;
        }

        // Validation: Description/Notes cannot be only numbers
        if (repairLog.notes && /^\d+$/.test(repairLog.notes.trim())) {
            alert("Technical notes cannot be only numbers. Please describe what was repaired.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/admin/equipment/${repairAsset.id}/resolve`, {
                action: repairLog.action,
                notes: repairLog.notes,
                cost: repairLog.cost
            }, { headers: { Authorization: auth } });
            setRepairAsset(null);
            setRepairLog({ action: '', notes: '', cost: '' });
            fetchEquipment();
        } catch (err) {
            alert("Repair log failed: " + (err.response?.data?.message || err.message));
        }
    };

    const fetchHistory = async (id) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get(`http://localhost:8080/api/admin/equipment/${id}/history`, {
                headers: { Authorization: auth }
            });
            setHistoryData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteEquipment = async (id) => {
        if (!window.confirm("Are you sure you want to retire this asset?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/admin/equipment/${id}`, {
                headers: { Authorization: auth }
            });
            fetchEquipment();
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <AdminSidebar activePage="equipment" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <AdminHeader title="" subtitle="Strategic asset oversight and technical resolution portal." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Equipment Maintenance</h2>
                                <p className="text-slate-300 font-medium">Manage and repair fitness assets.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search asset..." 
                                        className="pl-12 pr-6 py-3 rounded-2xl bg-white/10 text-white placeholder-slate-400 border border-white/20 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 w-64 font-medium backdrop-blur-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Tag size={18} />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (showAdd && isEditing) {
                                            setFormData({ name: '', brand: '', serialNumber: '', location: '', cost: '', status: 'WORKING', equipmentCondition: 'EXCELLENT', nextMaintenanceDate: '', alternativeId: '', alternativeName: '', fallbackExercise: '' });
                                            setIsEditing(false);
                                        } else {
                                            setShowAdd(!showAdd);
                                            setIsEditing(false);
                                        }
                                    }} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    <Plus size={20} /> {isEditing ? 'Cancel Edit' : 'Register New Asset'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full relative z-20 mt-6 grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {showAdd && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-10">
                                <h3 className="text-2xl font-black mb-8">Asset Registration</h3>
                                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                                    <input type="text" placeholder="Equipment Name" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    <input type="text" placeholder="Brand" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                                    <input type="text" placeholder="Serial Number" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none" value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} />
                                    <input type="text" placeholder="Location (e.g. Zone A)" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                    <input type="number" placeholder="Cost (Rs.)" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                                    <input 
                                        type="date" 
                                        placeholder="Next Maintenance" 
                                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none" 
                                        value={formData.nextMaintenanceDate} 
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setFormData({ ...formData, nextMaintenanceDate: e.target.value })} 
                                    />
                                    <select className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none" value={formData.equipmentCondition} onChange={e => setFormData({ ...formData, equipmentCondition: e.target.value })}>
                                        <option value="EXCELLENT">Excellent</option>
                                        <option value="GOOD">Good</option>
                                        <option value="FAIR">Fair</option>
                                        <option value="POOR">Poor</option>
                                    </select>
                                    <div className="col-span-2 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Secondary Backup (Alternative Machine)</label>
                                            <select 
                                                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none text-sm" 
                                                value={formData.alternativeId} 
                                                onChange={e => {
                                                    const selected = equipment.find(eq => eq.id.toString() === e.target.value);
                                                    setFormData({ ...formData, alternativeId: e.target.value, alternativeName: selected ? selected.name : '' });
                                                }}
                                            >
                                                <option value="">No Secondary machine</option>
                                                {equipment.filter(eq => !formData.id || eq.id !== formData.id).map(eq => (
                                                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.brand})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-1 flex items-center gap-2">
                                                <Activity size={12} /> Final Fallback (Bodyweight/No-Equipment Alternative)
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. 50 Jumping Jacks or 10 mins Outdoor Jogging" 
                                                className="w-full p-4 rounded-2xl bg-blue-50/50 border border-blue-100 font-bold outline-none placeholder:text-blue-300" 
                                                value={formData.fallbackExercise} 
                                                onChange={e => setFormData({ ...formData, fallbackExercise: e.target.value })} 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-colors">Register Asset</button>
                                        <button type="button" onClick={() => setShowAdd(false)} className="px-8 bg-slate-100 text-slate-600 font-black rounded-2xl">Cancel</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Asset Details</th>
                                        <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                        <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {equipment.filter(eq => 
                                        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (eq.brand && eq.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                        (eq.location && eq.location.toLowerCase().includes(searchTerm.toLowerCase()))
                                    ).map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                        <Tag size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{item.name}</p>
                                                        <p className="text-xs text-slate-400 font-bold">{item.location || 'Gym Floor'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.status === 'WORKING' ? 'bg-emerald-50 text-emerald-600' :
                                                    item.status === 'BROKEN' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {item.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(item.status === 'UNDER_MAINTENANCE' || item.status === 'BROKEN') && (
                                                        <button
                                                            onClick={() => setRepairAsset(item)}
                                                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
                                                        >
                                                            <CheckCircle size={14} /> Resolve
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setHistoryAsset(item);
                                                            fetchHistory(item.id);
                                                        }} 
                                                        className="p-3 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title="Maintenance History"
                                                    >
                                                        <Activity size={20} />
                                                    </button>
                                                    <button onClick={() => handleEdit(item)} className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                                        <PenTool size={20} />
                                                    </button>
                                                    <button onClick={() => deleteEquipment(item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="h-fit sticky top-10">
                        <AnimatePresence>
                            {repairAsset && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden ring-4 ring-blue-500/30"
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex items-center gap-3 text-blue-400">
                                                <Wrench size={24} />
                                                <h2 className="text-2xl font-black">Technical Log</h2>
                                            </div>
                                            <button onClick={() => setRepairAsset(null)} className="text-slate-500 hover:text-white transition-colors">
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <form onSubmit={submitRepair} className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-slate-500 text-center">Repairing Asset</label>
                                                <div className="bg-white/5 p-4 rounded-xl font-black text-center border border-white/10 text-blue-400 uppercase tracking-widest">{repairAsset.name}</div>
                                            </div>

                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="Action Taken (e.g. Belt Replacement)"
                                                    className="w-full bg-white/5 p-4 rounded-xl font-bold outline-none border border-white/10 focus:border-blue-500 placeholder:text-slate-700"
                                                    value={repairLog.action}
                                                    onChange={e => setRepairLog({ ...repairLog, action: e.target.value })}
                                                    required
                                                />
                                                <textarea
                                                    placeholder="Detailed Technical Notes"
                                                    className="w-full bg-white/5 p-4 rounded-xl font-bold outline-none border border-white/10 focus:border-blue-500 h-28 placeholder:text-slate-700"
                                                    value={repairLog.notes}
                                                    onChange={e => setRepairLog({ ...repairLog, notes: e.target.value })}
                                                ></textarea>
                                                <div className="relative">
                                                    <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="number"
                                                        placeholder="Technical Cost (Rs.)"
                                                        className="w-full bg-white/5 p-4 pl-10 rounded-xl font-bold outline-none border border-white/10 focus:border-blue-500"
                                                        value={repairLog.cost}
                                                        onChange={e => setRepairLog({ ...repairLog, cost: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                                <CheckCircle size={20} /> Resolve & Mark Working
                                            </button>
                                        </form>
                                    </div>
                                    <PenTool className="absolute right-[-10%] bottom-[-10%] text-white/5 w-40 h-40" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!repairAsset && (
                            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Technical Guidelines
                                </h4>
                                <ul className="space-y-5">
                                    <li className="flex gap-4 text-xs font-bold text-slate-600 leading-relaxed">
                                        <div className="w-6 h-6 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">1</div>
                                        <span>Only authorized administrators can log repairs and restore equipment availability.</span>
                                    </li>
                                    <li className="flex gap-4 text-xs font-bold text-slate-600 leading-relaxed">
                                        <div className="w-6 h-6 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">2</div>
                                        <span>Ensure all costs are accurate for quarterly financial reporting.</span>
                                    </li>
                                </ul>
                            </div>
                        )}
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

                {historyAsset && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setHistoryAsset(null)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-4xl rounded-[2.5rem] p-10 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Maintenance History</h3>
                                    <p className="text-slate-400 font-bold text-sm tracking-widest">{historyAsset.name} // {historyAsset.brand}</p>
                                </div>
                                <button onClick={() => setHistoryAsset(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                                {historyData.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <Activity className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No technical records found for this asset.</p>
                                    </div>
                                ) : (
                                    historyData.map((log, idx) => (
                                        <div key={log.id} className="relative pl-8 border-l-2 border-slate-100 pb-2">
                                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white" />
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] mb-1">{log.status}</p>
                                                        <h4 className="font-black text-slate-900">{log.issueType || 'Scheduled Maintenance'}</h4>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.logDate).toLocaleDateString()}</p>
                                                        {log.repairCost > 0 && <p className="text-sm font-black text-emerald-600">Rs. {log.repairCost.toLocaleString()}</p>}
                                                    </div>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-6 text-xs">
                                                    <div>
                                                        <p className="font-black uppercase tracking-tighter text-slate-400 mb-1">Issue Description</p>
                                                        <p className="font-bold text-slate-600 bg-white p-3 rounded-xl border border-slate-100">{log.description || 'No description provided.'}</p>
                                                    </div>
                                                    {log.actionTaken && (
                                                        <div>
                                                            <p className="font-black uppercase tracking-tighter text-blue-400 mb-1">Technical Resolution</p>
                                                            <p className="font-bold text-blue-900 bg-blue-50 p-3 rounded-xl border border-blue-100">{log.actionTaken}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {log.technician && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px]">
                                                        <span className="font-bold text-slate-400">Reported By: <span className="text-slate-900">{log.reportedBy?.firstName || 'Staff'}</span></span>
                                                        <span className="font-bold text-slate-400">Resolved By: <span className="text-slate-900">{log.technician?.firstName || 'Lead Tech'}</span></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EquipmentMaintenance;

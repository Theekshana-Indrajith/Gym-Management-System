import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { Wrench, Plus, AlertTriangle, CheckCircle, Clock, Calendar, Trash2, Edit3, X, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';
import AdminPageBanner from '../components/AdminPageBanner';

const STATUS_CONFIG = {
    WORKING: { label: 'Working', color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle },
    UNDER_MAINTENANCE: { label: 'Under Maintenance', color: 'bg-amber-50 text-amber-600', icon: Clock },
    BROKEN: { label: 'Broken', color: 'bg-red-50 text-red-600', icon: AlertTriangle },
};

const EquipmentMaintenance = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [editItem, setEditItem] = useState(null); // item being edited

    const auth = () => JSON.parse(localStorage.getItem('auth'));

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/api/admin/equipment', {
                headers: { Authorization: auth() }
            });
            setEquipment(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEquipment(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/admin/equipment',
                { name: newName, status: 'WORKING' },
                { headers: { Authorization: auth() } });
            setNewName('');
            setShowAdd(false);
            fetchEquipment();
        } catch {
            alert('Add failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this equipment?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/admin/equipment/${id}`, {
                headers: { Authorization: auth() }
            });
            fetchEquipment();
        } catch {
            alert('Delete failed');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/admin/equipment/${editItem.id}`, {
                name: editItem.name,
                status: editItem.status,
                lastMaintenanceDate: editItem.lastMaintenanceDate || null,
                nextMaintenanceDate: editItem.nextMaintenanceDate || null,
            }, { headers: { Authorization: auth() } });
            setEditItem(null);
            fetchEquipment();
        } catch {
            alert('Update failed');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

    const isOverdue = (d) => d && new Date(d) < new Date();

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-slate-100">
            <AdminSidebar activePage="equipment" />
            <main className="ml-64 flex-1 p-6 flex flex-col">

                {/* Header */}
                <AdminPageBanner title="Equipment & Maintenance" subtitle="Asset Management" icon={Wrench} />

                <div className="mb-8 flex justify-end gap-3">
                    <button onClick={fetchEquipment} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-700 transition-all shadow-sm">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowAdd(!showAdd)} className="bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl transition-all active:scale-95 hover:bg-indigo-600">
                        <Plus size={20} /> New Asset
                    </button>
                </div>

                {/* Add Form */}
                <AnimatePresence>
                    {showAdd && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8 max-w-xl">
                            <h3 className="text-xl font-black mb-5">Register New Asset</h3>
                            <form onSubmit={handleAdd} className="flex gap-3">
                                <input type="text" placeholder="Equipment Name (e.g. Rack 05)"
                                    className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                                    value={newName} onChange={e => setNewName(e.target.value)} required />
                                <button className="bg-blue-600 text-white font-black px-8 rounded-2xl hover:bg-blue-700 transition-colors">Add</button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Asset Name</th>
                                <th className="px-8 py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Last Maintenance</th>
                                <th className="px-8 py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Next Maintenance</th>
                                <th className="px-8 py-5 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {equipment.map((item) => {
                                const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.WORKING;
                                const StatusIcon = sc.icon;
                                return (
                                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                    <Wrench size={18} />
                                                </div>
                                                <span className="font-bold text-slate-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sc.color}`}>
                                                <StatusIcon size={11} /> {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                                <Calendar size={13} className="text-slate-300" />
                                                {formatDate(item.lastMaintenanceDate)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={`flex items-center gap-1.5 text-sm font-bold ${isOverdue(item.nextMaintenanceDate) ? 'text-red-500' : 'text-slate-600'}`}>
                                                <Calendar size={13} className={isOverdue(item.nextMaintenanceDate) ? 'text-red-400' : 'text-slate-300'} />
                                                {formatDate(item.nextMaintenanceDate)}
                                                {isOverdue(item.nextMaintenanceDate) && (
                                                    <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider ml-1">Overdue</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setEditItem({ ...item })}
                                                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {equipment.length === 0 && !loading && (
                        <div className="py-20 text-center text-slate-300 font-bold italic">No assets registered.</div>
                    )}
                    {loading && (
                        <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-blue-400" size={28} /></div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            <AnimatePresence>
                {editItem && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Update Equipment</h2>
                                    <p className="text-slate-400 text-sm font-medium mt-1">{editItem.name}</p>
                                </div>
                                <button onClick={() => setEditItem(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Equipment Name</label>
                                    <input type="text" value={editItem.name}
                                        onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900" required />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Status</label>
                                    <select value={editItem.status}
                                        onChange={e => setEditItem({ ...editItem, status: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900">
                                        <option value="WORKING">Working</option>
                                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                        <option value="BROKEN">Broken</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Last Maintenance Date</label>
                                    <input type="date" value={editItem.lastMaintenanceDate || ''}
                                        onChange={e => setEditItem({ ...editItem, lastMaintenanceDate: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900" />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Next Maintenance Date</label>
                                    <input type="date" value={editItem.nextMaintenanceDate || ''}
                                        onChange={e => setEditItem({ ...editItem, nextMaintenanceDate: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setEditItem(null)}
                                        className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit"
                                        className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EquipmentMaintenance;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { CreditCard, Plus, Trash2, Check, X, Shield, Package, User, Clock, Eye, Box, Facebook, Twitter, Instagram, Edit3, Settings, EyeOff } from 'lucide-react';
import axios from 'axios';

const MembershipManagementAdmin = () => {
    const [packages, setPackages] = useState([]);
    const [requests, setRequests] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddPackage, setShowAddPackage] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);
    const [newPkg, setNewPkg] = useState({ name: '', description: '', price: '', durationMonths: 1, isActive: true });

    const auth = JSON.parse(localStorage.getItem('auth'));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pkgRes, reqRes, memRes] = await Promise.all([
                axios.get('http://localhost:8080/api/admin/membership/packages', { headers: { Authorization: auth } }),
                axios.get('http://localhost:8080/api/admin/membership/requests/pending', { headers: { Authorization: auth } }),
                axios.get('http://localhost:8080/api/admin/membership/members', { headers: { Authorization: auth } })
            ]);
            setPackages(pkgRes.data);
            setRequests(reqRes.data);
            setMembers(memRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePackage = async (e) => {
        e.preventDefault();
        try {
            if (editingPkg) {
                // Backend will ignore price/duration updates for existing ones
                await axios.put(`http://localhost:8080/api/admin/membership/packages/${editingPkg.id}`, newPkg, { headers: { Authorization: auth } });
            } else {
                await axios.post('http://localhost:8080/api/admin/membership/packages', newPkg, { headers: { Authorization: auth } });
            }
            closeModal();
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to save package");
        }
    };

    const closeModal = () => {
        setShowAddPackage(false);
        setEditingPkg(null);
        setNewPkg({ name: '', description: '', price: '', durationMonths: 1, isActive: true });
    };

    const openEditModal = (pkg) => {
        setEditingPkg(pkg);
        setNewPkg({ ...pkg });
        setShowAddPackage(true);
    };


    const handleProcessRequest = async (id, approve) => {
        const action = approve ? 'approve' : 'reject';
        try {
            await axios.post(`http://localhost:8080/api/admin/membership/requests/${id}/${action}`, {}, { headers: { Authorization: auth } });
            fetchData();
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} request`);
        }
    };

    const handleDeactivateMember = async (userId) => {
        if (!window.confirm("Revoke this member's access? This will cancel their current legacy plan.")) return;
        try {
            await axios.post(`http://localhost:8080/api/admin/membership/members/${userId}/deactivate`, {}, { headers: { Authorization: auth } });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to deactivate membership");
        }
    };

    const isPackageUsed = (pkgId) => {
        return members.some(m => m.activePackage?.id === pkgId);
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <AdminSidebar activePage="membership" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <AdminHeader title="" subtitle="Configure elite packages and manage athlete access control." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB Core</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight uppercase italic underline decoration-blue-600 underline-offset-8">Legacy Management</h2>
                                <p className="text-slate-300 font-medium italic mt-4">Control membership tiers and verification protocols.</p>
                            </div>
                            <button
                                onClick={() => setShowAddPackage(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-5 rounded-[2rem] flex items-center gap-3 shadow-2xl shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                            >
                                <Plus size={20} /> Deploy New Legacy
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full relative z-20 mt-6 grid lg:grid-cols-2 gap-12">
                    {/* Packages Section */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-slate-900 border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">Legacy Plans</h2>
                        <div className="grid gap-6">
                            {packages.length === 0 ? (
                                <div className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold italic">
                                    No elite plans deployed. Click the button above to start.
                                </div>
                            ) : packages.map(pkg => {
                                const used = isPackageUsed(pkg.id);
                                return (
                                    <div key={pkg.id} className={`bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden ${!pkg.isActive ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
                                        {!pkg.isActive && (
                                            <div className="absolute top-4 left-4 z-20">
                                                <div className="bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-red-500/20">
                                                    <EyeOff size={10} /> Hidden from Members
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Package size={80} />
                                        </div>
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{pkg.name}</h3>
                                                <p className="text-slate-400 text-sm mb-6 line-clamp-1 italic font-medium">{pkg.description}</p>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2 text-blue-600">
                                                        <span className="text-[10px] uppercase font-black tracking-[0.2em] bg-blue-50 px-2 py-1 rounded-lg">LKR</span>
                                                        <span className="text-2xl font-black tracking-tighter italic">{pkg.price}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                                        <Clock size={16} />
                                                        {pkg.durationMonths} Months
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <button
                                                    onClick={() => openEditModal(pkg)}
                                                    className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl"
                                                    title={used ? "Update Visibility/Details" : "Edit Plan"}
                                                >
                                                    <Edit3 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        {used && (
                                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase italic">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20"></div>
                                                    Elite Members Enrolled
                                                </div>
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Permanent legacy record</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pending Requests Section */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-tighter">Verification Queue</h2>
                        <div className="space-y-6">
                            {requests.length === 0 ? (
                                <div className="bg-slate-900 p-16 rounded-[4rem] text-center text-slate-500 font-bold italic shadow-2xl relative overflow-hidden flex flex-col items-center">
                                    <Shield size={48} className="mb-4 opacity-20" />
                                    The vault is secure. All recruits verified.
                                </div>
                            ) : requests.map(req => (
                                <div key={req.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-900 shadow-inner">
                                            <User size={28} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tight text-lg">{req.user.username}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{new Date(req.requestDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="ml-auto bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-blue-500/20">
                                            {req.membershipPackage?.name || 'LEGACY DEPLOYED'}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mb-8">
                                        <div className="flex-1 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">TXN Reference</p>
                                            <p className="font-mono text-sm font-black text-slate-900">{req.paymentReference || 'N/A'}</p>
                                        </div>
                                        {req.paymentSlipUrl && (
                                            <a
                                                href={`http://localhost:8080${req.paymentSlipUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-inner group/view"
                                            >
                                                <Eye size={32} className="group-hover/view:scale-110 transition-transform" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleProcessRequest(req.id, true)}
                                            className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 uppercase text-xs tracking-[0.2em]"
                                        >
                                            <Check size={20} /> Verify Access
                                        </button>
                                        <button
                                            onClick={() => handleProcessRequest(req.id, false)}
                                            className="bg-slate-100 text-slate-400 font-black px-10 rounded-[2rem] hover:bg-red-50 hover:text-red-500 transition-all uppercase text-xs tracking-[0.2em]"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Member Database Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Elite Member Database</h2>
                                <div className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] flex items-center gap-4 shadow-2xl">
                                    <User size={18} className="text-blue-500" />
                                    <span className="text-sm font-black uppercase tracking-widest">{members.length} Total Recruits</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Athlete Identity</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100">Active Legacy</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 text-center">Protocol</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right italic border-b border-slate-100">Access Key</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {members.map(member => (
                                            <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group/row">
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm uppercase shadow-lg group-hover/row:scale-110 transition-transform">
                                                            {member.username[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 uppercase text-md tracking-tighter">{member.username}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold tracking-wide italic">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <span className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${member.activePackage ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-300'}`}>
                                                        {member.activePackage?.name || 'PENDING ASSIGNMENT'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-8 text-center">
                                                    <span className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${member.membershipStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                                                        {member.membershipStatus}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-8 text-right">
                                                    {member.membershipStatus === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => handleDeactivateMember(member.id)}
                                                            className="bg-red-50 text-red-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {showAddPackage && (
                        <div 
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 py-20 overflow-y-auto bg-slate-950/90 backdrop-blur-2xl transition-all cursor-pointer"
                            onClick={closeModal}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 relative cursor-default"
                            >
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    className="absolute right-10 top-10 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-all shadow-xl z-[10000] cursor-pointer"
                                >
                                    <X size={32} strokeWidth={3} />
                                </button>

                                <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 relative">
                                    <div>
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{editingPkg ? 'Refine Legacy' : 'New Protocol'}</h3>
                                        <p className="text-slate-400 font-bold italic mt-2 uppercase text-[10px] tracking-widest">
                                            {editingPkg ? `UPDATING: ${editingPkg.name}` : 'DEFINE NEW ELITE ACCESS'}
                                        </p>
                                    </div>
                                </div>
                                <form onSubmit={handleCreatePackage} className="p-12 space-y-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-8">Legacy Designation</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-[2rem] px-10 py-6 font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all text-xl uppercase placeholder:text-slate-200 shadow-inner"
                                            value={newPkg.name}
                                            onChange={e => setNewPkg({ ...newPkg, name: e.target.value })}
                                            placeholder="TITAN PROTOCOL"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-10">LKR EXCHANGE</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    disabled={!!editingPkg}
                                                    className={`w-full bg-slate-50 border-none rounded-[2rem] px-10 py-6 font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all text-2xl text-center shadow-inner ${!!editingPkg ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    value={newPkg.price}
                                                    onChange={e => setNewPkg({ ...newPkg, price: e.target.value })}
                                                    placeholder="15000"
                                                />
                                                {!!editingPkg && <div className="absolute inset-0 z-10" title="Financials are permanent per legacy."></div>}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-10">MONTHS ACTIVE</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    disabled={!!editingPkg}
                                                    className={`w-full bg-slate-50 border-none rounded-[2rem] px-10 py-6 font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all text-2xl text-center shadow-inner ${!!editingPkg ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    value={newPkg.durationMonths}
                                                    onChange={e => setNewPkg({ ...newPkg, durationMonths: e.target.value })}
                                                    placeholder="1"
                                                />
                                                {!!editingPkg && <div className="absolute inset-0 z-10" title="Duration is permanent per legacy."></div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-8">Mission Protocol</label>
                                        <textarea
                                            rows="3"
                                            className="w-full bg-slate-50 border-none rounded-[2.5rem] px-10 py-8 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all italic leading-relaxed shadow-inner"
                                            value={newPkg.description}
                                            onChange={e => setNewPkg({ ...newPkg, description: e.target.value })}
                                            placeholder="Mention premium training, AI mapping, and elite perks."
                                        ></textarea>
                                    </div>

                                    <div className="flex items-center gap-6 bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative group">
                                        <div 
                                            className="relative inline-flex items-center cursor-pointer"
                                            onClick={() => setNewPkg(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        >
                                            <div className={`w-14 h-8 transition-all rounded-full relative shadow-inner ${newPkg.isActive ? 'bg-blue-600' : 'bg-slate-700'}`}>
                                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${newPkg.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col cursor-pointer" onClick={() => setNewPkg(prev => ({ ...prev, isActive: !prev.isActive }))}>
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Visible in Vault</span>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 italic">
                                                {newPkg.isActive ? 'Members can recruit into this legacy' : 'Hidden from new recruits'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 bg-slate-50 text-slate-400 font-black py-7 rounded-[2rem] hover:bg-slate-100 transition-all uppercase tracking-[0.3em] text-[10px] shadow-sm"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-slate-900 text-white font-black py-7 rounded-[2rem] hover:bg-blue-600 transition-all shadow-2xl uppercase tracking-[0.3em] text-[10px] border border-blue-600/20"
                                        >
                                            {editingPkg ? 'Finalize Protocol' : 'Deploy Protocol'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <footer className="bg-slate-950 text-slate-400 py-16 px-12 mt-auto w-full flex flex-col items-center">
                    <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-16 border-b border-white/5 pb-12">
                        <div className="flex flex-col gap-6 max-w-[240px]">
                            <div className="flex items-center gap-3 text-white font-black text-2xl tracking-tighter uppercase">
                                <Box className="text-blue-500" size={32} /> MUSCLEHUB
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-500 font-bold italic tracking-wide">
                                Engineering elite fitness legacy systems.
                                <br />Colombo HQ &copy; 2026 Admin Portal
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[10px]">
                            {['About', 'Plans', 'Support', 'Legal'].map(section => (
                                <div key={section}>
                                    <h4 className="text-white font-black mb-6 uppercase tracking-[0.2em] italic">{section}</h4>
                                    <ul className="space-y-3 opacity-40 leading-relaxed text-slate-400 font-bold uppercase tracking-widest text-[8px]">
                                        <li>Nexus Protocol</li>
                                        <li>Elite Ops</li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default MembershipManagementAdmin;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { CreditCard, Plus, Trash2, Check, X, Shield, Package, User, Clock, DollarSign, Eye, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import AdminPageBanner from '../components/AdminPageBanner';

const MembershipManagementAdmin = () => {
    const [packages, setPackages] = useState([]);
    const [requests, setRequests] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddPackage, setShowAddPackage] = useState(false);
    const [newPkg, setNewPkg] = useState({ name: '', description: '', price: '', durationMonths: 1 });

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
            await axios.post('http://localhost:8080/api/admin/membership/packages', newPkg, { headers: { Authorization: auth } });
            setShowAddPackage(false);
            setNewPkg({ name: '', description: '', price: '', durationMonths: 1 });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to create package");
        }
    };

    const handleDeletePackage = async (id) => {
        if (!window.confirm("Delete this package?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/admin/membership/packages/${id}`, { headers: { Authorization: auth } });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete package");
        }
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


    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-slate-100">
            <AdminSidebar activePage="membership" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <AdminPageBanner title="Membership Control" subtitle="Manage subscription packages and verify member payments." icon={Shield} />

                <div className="mb-8 flex justify-end">
                    <button
                        onClick={() => setShowAddPackage(true)}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus size={20} /> Create New Package
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Packages Section */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-slate-900 border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">Packages</h2>
                        <div className="grid gap-6">
                            {packages.length === 0 ? (
                                <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 font-bold italic">
                                    No packages defined yet.
                                </div>
                            ) : packages.map(pkg => (
                                <div key={pkg.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Package size={80} />
                                    </div>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 mb-1">{pkg.name}</h3>
                                            <p className="text-slate-400 text-sm mb-4 line-clamp-1">{pkg.description}</p>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-blue-600 font-black">
                                                    <DollarSign size={16} />
                                                    <span className="text-2xl tracking-tighter">{pkg.price}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                    <Clock size={16} />
                                                    {pkg.durationMonths} Months
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePackage(pkg.id)}
                                            className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Requests Section */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-tighter">Verification Queue</h2>
                        <div className="space-y-6">
                            {requests.length === 0 ? (
                                <div className="bg-slate-900 p-12 rounded-[2.5rem] text-center text-slate-400 font-bold italic shadow-2xl relative overflow-hidden">
                                    <Shield size={60} className="mx-auto mb-4 opacity-10" />
                                    Empty queue. All members verified.
                                </div>
                            ) : requests.map(req => (
                                <div key={req.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase">{req.user.username}</p>
                                            <p className="text-xs text-slate-400 font-medium">Requested on {new Date(req.requestDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="ml-auto bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            {req.membershipPackage.name}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mb-6">
                                        <div className="flex-1 bg-slate-50 p-4 rounded-3xl">
                                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Payment Reference</p>
                                            <p className="font-mono text-sm font-bold text-slate-600">{req.paymentReference || 'N/A'}</p>
                                        </div>
                                        {req.paymentSlipUrl && (
                                            <a
                                                href={`http://localhost:8080${req.paymentSlipUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm group/view"
                                                title="View Payment Slip"
                                            >
                                                <Eye size={24} className="group-hover/view:scale-110 transition-transform" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleProcessRequest(req.id, true)}
                                            className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                                        >
                                            <Check size={20} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleProcessRequest(req.id, false)}
                                            className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 text-red-500 transition-all"
                                        >
                                            <X size={20} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Member Database Section */}
                <div className="mt-16 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black text-slate-900 border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">Member Database</h2>
                        <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                            {members.length} Total Members
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Plan</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {members.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase">
                                                    {member.username[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase text-sm">{member.username}</p>
                                                    <p className="text-xs text-slate-400">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${member.activePackage ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-400'}`}>
                                                {member.activePackage?.name || 'No Active Plan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-xs uppercase tracking-widest">
                                            <span className={member.membershipStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}>
                                                {member.membershipStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Package Modal */}
                <AnimatePresence>
                    {showAddPackage && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-20 overflow-y-auto bg-slate-900/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden"
                            >
                                <div className="p-10 border-b border-slate-50">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Define Package</h3>
                                    <p className="text-slate-400 font-medium italic">Enter details for the new membership subscription.</p>
                                </div>
                                <form onSubmit={handleCreatePackage} className="p-10 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Package Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                                            value={newPkg.name}
                                            onChange={e => setNewPkg({ ...newPkg, name: e.target.value })}
                                            placeholder="e.g. Platinum Elite"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Price ($)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                                            value={newPkg.price}
                                            onChange={e => setNewPkg({ ...newPkg, price: e.target.value })}
                                            placeholder="99.99"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Duration (Months)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                                            value={newPkg.durationMonths}
                                            onChange={e => setNewPkg({ ...newPkg, durationMonths: e.target.value })}
                                            placeholder="1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
                                        <textarea
                                            rows="3"
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                                            value={newPkg.description}
                                            onChange={e => setNewPkg({ ...newPkg, description: e.target.value })}
                                            placeholder="What's included in this plan?"
                                        ></textarea>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddPackage(false)}
                                            className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-200 transition-colors"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-colors shadow-xl shadow-blue-500/20"
                                        >
                                            SAVE PACKAGE
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MembershipManagementAdmin;

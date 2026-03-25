import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { ShoppingBag, Search, Calendar, User, Package, DollarSign, Filter, RefreshCw, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import AdminPageBanner from '../components/AdminPageBanner';

const AdminOrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/admin/supplements/orders', {
                headers: { Authorization: auth }
            });
            // Reverse to show latest first
            setOrders(res.data.reverse());
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.supplementName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'All' || order.category === filterCategory;

        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(orders.map(o => o.category).filter(Boolean))];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-slate-100">
            <AdminSidebar activePage="order-history" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <AdminPageBanner title="Order History" subtitle="Sales Management and History" icon={ShoppingBag} />

                <div className="mb-8 flex justify-end">
                    <button
                        onClick={fetchOrders}
                        className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by member or supplement..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none font-medium text-slate-700"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bg-blue-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-blue-500/20">
                        <div>
                            <p className="text-xs font-bold uppercase opacity-60">Total Sales</p>
                            <p className="text-2xl font-black">${orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0).toLocaleString()}</p>
                        </div>
                        <DollarSign size={32} className="opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Member</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Supplement</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {filteredOrders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight">#{order.id.toString().padStart(5, '0')}</p>
                                                    <p className="text-xs text-slate-400 font-medium">Order ID</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                                                    {order.username?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 uppercase tracking-tight">{order.username}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{order.userEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{order.supplementName}</p>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Qty: {order.quantity}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-black text-sm">
                                                ${order.totalPrice?.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {new Date(order.orderDate).toLocaleDateString()}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(order.orderDate).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && !loading && (
                        <div className="text-center py-20 bg-slate-50/30">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
                            <p className="text-slate-400 font-medium">Try adjusting your search or filters.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="p-20 flex justify-center">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminOrderHistory;

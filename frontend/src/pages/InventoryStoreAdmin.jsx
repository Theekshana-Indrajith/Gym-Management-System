import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { Store, Plus, Package, AlertCircle, TrendingUp, Trash2, Edit2, X, Image as ImageIcon, CheckCircle, Truck, ShoppingBag, Phone, MapPin, Box, Facebook, Twitter, Instagram, CreditCard, DollarSign } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Eye } from 'lucide-react';

const InventoryStoreAdmin = () => {
    const [supplements, setSupplements] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'orders'
    const [selectedSlip, setSelectedSlip] = useState(null);

    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ name: '', brand: '', price: '', stock: '', category: 'Protein', description: '', image: '', servingSize: '', dailyFrequency: '', suggestedUse: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchSupplements = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/supplements', {
                headers: { Authorization: auth }
            });
            setSupplements(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOrders = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/admin/orders', {
                headers: { Authorization: auth }
            });
            setOrders(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSupplements();
        fetchOrders();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', brand: '', price: '', stock: '', category: 'Protein', description: '', image: '', servingSize: '', dailyFrequency: '', suggestedUse: '' });
        setIsEditing(false);
        setEditId(null);
        setShowAdd(false);
    };

    const handleEditClick = (item) => {
        setFormData({
            name: item.name,
            brand: item.brand,
            price: item.price,
            stock: item.stock,
            category: item.category,
            description: item.description || '',
            image: item.image || '',
            servingSize: item.servingSize || '',
            dailyFrequency: item.dailyFrequency || '',
            suggestedUse: item.suggestedUse || ''
        });
        setEditId(item.id);
        setIsEditing(true);
        setShowAdd(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData(prev => ({ ...prev, image: compressedBase64 }));
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (/^\d+$/.test(formData.name.trim())) {
            alert("Product name cannot be only numbers. Please provide a descriptive name.");
            return;
        }
        if (/^\d+$/.test(formData.brand.trim())) {
            alert("Brand name cannot be only numbers. Please provide a valid brand name.");
            return;
        }
        if (!isEditing && parseInt(formData.stock) <= 0) {
            alert("Initial stock must be greater than 0 when listing a new product.");
            return;
        }
        if (parseFloat(formData.price) <= 0) {
            alert("Price must be greater than 0.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (isEditing) {
                await axios.put(`http://localhost:8080/api/supplements/${editId}`, formData, {
                    headers: { Authorization: auth }
                });
                alert("Updated successfully");
            } else {
                await axios.post('http://localhost:8080/api/supplements', formData, {
                    headers: { Authorization: auth }
                });
                alert("Added successfully");
            }
            resetForm();
            fetchSupplements();
        } catch (err) {
            alert("Operation failed: " + (err.response?.data?.message || err.message));
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/supplements/${id}`, {
                headers: { Authorization: auth }
            });
            fetchSupplements();
        } catch (err) {
            alert("Delete failed");
            console.error(err);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.patch(`http://localhost:8080/api/admin/orders/${orderId}/status?status=${newStatus}`, {}, {
                headers: { Authorization: auth }
            });
            fetchOrders();
            alert("Order status updated!");
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm("Are you sure you want to cancel this order? This will restock items and refund the user if applicable.")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.patch(`http://localhost:8080/api/admin/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: auth }
            });
            fetchOrders();
            alert("Order cancelled, items restocked and user refunded.");
        } catch (err) {
            console.error(err);
            alert("Failed to cancel order");
        }
    };

    const generateInvoice = (order) => {
        const doc = new jsPDF();
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.text('MUSCLEHUB', 20, 25);
        doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text('OFFICIAL INVOICE', 150, 25);
        doc.setTextColor(0, 0, 0); doc.setFontSize(10);
        doc.text(`Invoice To: ${order.user.username}`, 20, 55);
        doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 62);
        doc.text(`Order ID: #${order.id}`, 20, 69);
        doc.text(`Delivery: ${order.deliveryMethod}`, 140, 55);
        doc.text(`Contact: ${order.contactNumber}`, 140, 62);
        doc.text(`Status: ${order.status}`, 140, 69);
        const tableColumn = ["Item", "Unit Price", "Quantity", "Total"];
        const tableRows = order.items.map(item => [
            item.supplement.name,
            `$${item.priceAtPurchase.toFixed(2)}`,
            item.quantity,
            `$${(item.priceAtPurchase * item.quantity).toFixed(2)}`
        ]);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 85, theme: 'grid', headStyles: { fillColor: [37, 99, 235] } });
        const finalY = doc.lastAutoTable.finalY + 10;
        const subtotal = order.totalPrice - (order.deliveryMethod === 'COURIER' ? 50 : 0);
        doc.setFont('helvetica', 'bold'); doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, finalY);
        if (order.deliveryMethod === 'COURIER') doc.text(`Shipping: $50.00`, 140, finalY + 7);
        doc.setFontSize(14); doc.setTextColor(37, 99, 235); doc.text(`TOTAL: $${order.totalPrice.toFixed(2)}`, 140, finalY + 17);
        doc.setFontSize(8); doc.setTextColor(150, 150, 150); doc.text('MuscleHub Management System - Order Invoice', 105, 280, { align: 'center' });
        doc.save(`Invoice_${order.id}_${order.user.username}.pdf`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-amber-500 bg-amber-50 border border-amber-100';
            case 'AWAITING_PAYMENT_APPROVAL': return 'text-orange-500 bg-orange-50 border border-orange-100';
            case 'PAYMENT_VERIFIED': return 'text-emerald-500 bg-emerald-50 border border-emerald-100';
            case 'PREPARED': return 'text-blue-500 bg-blue-50 border border-blue-100';
            case 'SHIPPED': return 'text-purple-500 bg-purple-50 border border-purple-100';
            case 'COMPLETED': return 'text-green-500 bg-green-50 border border-green-100';
            case 'CANCELLED': return 'text-rose-500 bg-rose-50 border border-rose-100';
            default: return 'text-slate-500 bg-slate-50 border border-slate-100';
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <AdminSidebar activePage="inventory" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <AdminHeader title="" subtitle="Manage stock levels and track supplement orders." lightTheme={true} />

                        <div className="mt-8 mb-4 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Inventory & Store</h2>
                                <p className="text-slate-300 font-medium">Full visibility over shop operations.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-sm flex gap-2">
                                    <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-white/10'}`}>Inventory</button>
                                    <button onClick={() => setActiveTab('orders')} className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-white/10'}`}>
                                        Orders {(orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length) > 0 && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length} Active</span>}
                                    </button>
                                </div>
                                {activeTab === 'inventory' && (
                                    <button onClick={() => { resetForm(); setShowAdd(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                                        <Plus size={20} /> Add Product
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full relative z-20 mt-6">
                    {activeTab === 'inventory' ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                                    <Package size={32} className="text-blue-500 mb-4" />
                                    <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Total SKU</h3>
                                    <p className="text-4xl font-black text-slate-900">{supplements.length}</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-xl flex items-center justify-between">
                                    <div>
                                        <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Low Stock Alerts</h3>
                                        <p className="text-4xl font-black text-red-500">{supplements.filter(s => s.stock < 10).length}</p>
                                    </div>
                                    <AlertCircle size={48} className="text-red-100" />
                                </div>
                                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                                    <TrendingUp size={32} className="text-emerald-500 mb-4" />
                                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Total Orders</h3>
                                    <p className="text-4xl font-black text-emerald-500">{orders.length}</p>
                                </div>
                            </div>

                            {showAdd && (
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-10 relative">
                                    <button onClick={() => setShowAdd(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
                                    <h3 className="text-2xl font-black mb-8">{isEditing ? 'Edit Supplement' : 'New Supplement Details'}</h3>
                                    <form onSubmit={handleSubmit} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        <input type="text" placeholder="Product Name" className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        <input type="text" placeholder="Brand" className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                                        <input type="number" placeholder="Price (LKR)" className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                        <input type="number" placeholder="In Stock" className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                        <div className="col-span-full">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Product Image</label>
                                            <div className="flex items-center gap-4">
                                                {formData.image && <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />}
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                            </div>
                                        </div>
                                        <select className="col-span-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            <option>Protein</option><option>Creatine</option><option>Pre-Workout</option><option>Vitamins</option><option>Recovery</option><option>Mass Gainer</option>
                                        </select>
                                        
                                        {/* New Insight Fields */}
                                        <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 mt-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Serving Size</label>
                                                <input type="text" placeholder="e.g. 1 Scoop - 30g" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.servingSize} onChange={e => setFormData({ ...formData, servingSize: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Daily Frequency</label>
                                                <input type="text" placeholder="e.g. Twice a day" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.dailyFrequency} onChange={e => setFormData({ ...formData, dailyFrequency: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Suggested Use</label>
                                                <input type="text" placeholder="e.g. Pre-workout" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.suggestedUse} onChange={e => setFormData({ ...formData, suggestedUse: e.target.value })} />
                                            </div>
                                        </div>

                                        <textarea placeholder="Product Description" className="col-span-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-medium min-h-[100px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                        
                                        <button className="col-span-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg hover:bg-black transition-all">
                                            {isEditing ? 'Update Supplement' : 'List Supplement'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-8 py-6 text-xs font-black uppercase text-slate-400">Product</th>
                                            <th className="px-8 py-6 text-xs font-black uppercase text-slate-400">Category</th>
                                            <th className="px-8 py-6 text-xs font-black uppercase text-slate-400">Price</th>
                                            <th className="px-8 py-6 text-xs font-black uppercase text-slate-400">Stock Status</th>
                                            <th className="px-8 py-6 text-xs font-black uppercase text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {supplements.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative group/preview cursor-pointer z-10">
                                                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-black overflow-hidden relative">
                                                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover/preview:scale-110" /> : <Store size={24} />}
                                                            </div>
                                                            {item.image && (
                                                                <div className="absolute left-16 top-1/2 -translate-y-1/2 w-48 h-48 bg-white border border-slate-100 shadow-2xl rounded-3xl opacity-0 invisible group-hover/preview:opacity-100 group-hover/preview:visible transition-all duration-300 z-[200] overflow-hidden pointer-events-none origin-left scale-95 group-hover/preview:scale-100">
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div><p className="font-black text-slate-900 leading-none mb-1">{item.name}</p><p className="text-xs text-slate-400">{item.brand}</p></div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6"><span className="text-slate-600 font-bold text-sm bg-slate-100 px-3 py-1 rounded-lg">{item.category}</span></td>
                                                <td className="px-8 py-6 font-black text-slate-900">LKR {item.price.toLocaleString()}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-2 w-36">
                                                        <div className={`flex items-center justify-between font-black text-[10px] uppercase tracking-widest ${item.stock < 10 ? 'text-red-600' : item.stock <= 50 ? 'text-orange-500' : 'text-emerald-600'}`}>
                                                            <span>{item.stock} UNITS</span>
                                                            {item.stock < 10 && <span className="bg-red-50 px-2 py-0.5 rounded-md">Reorder</span>}
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-1000 ${item.stock < 10 ? 'bg-red-500' : item.stock <= 50 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                                                style={{ width: `${Math.min((item.stock / 100) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6"><div className="flex gap-2"><button onClick={() => handleEditClick(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 size={16} /></button><button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {orders.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
                                    <Package size={48} className="text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-slate-900 uppercase">No orders found</h3>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                                    <ShoppingBag size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">Order #{order.id} - By {order.user.username}</h4>
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{new Date(order.orderDate).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-6 w-full max-w-lg">
                                                {/* Visual Lifecycle Stepper */}
                                                <div className="w-full flex items-center justify-between px-2 mb-2 relative">
                                                    {['PENDING', 'AWAITING_PAYMENT_APPROVAL', 'PAYMENT_VERIFIED', 'PREPARED', 'SHIPPED', 'COMPLETED'].map((step, idx, arr) => {
                                                        const statusIndex = arr.indexOf(order.status);
                                                        const isCompleted = statusIndex >= idx;
                                                        const isCurrent = order.status === step;
                                                        const isCancelled = order.status === 'CANCELLED';

                                                        return (
                                                            <React.Fragment key={step}>
                                                                <div className="flex flex-col items-center gap-2 relative z-10 group/step cursor-help">
                                                                    <div 
                                                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                                                                            isCurrent ? 'bg-blue-600 border-blue-600 text-white scale-125 shadow-lg' :
                                                                            isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                                                                            isCancelled ? 'bg-rose-100 border-rose-200 text-rose-500' :
                                                                            'bg-white border-slate-200 text-slate-300'
                                                                        }`}
                                                                    >
                                                                        {isCompleted && !isCurrent ? <CheckCircle size={12} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                                                    </div>
                                                                    <div className="absolute top-8 opacity-0 group-hover/step:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] font-black uppercase px-2 py-1 rounded-md whitespace-nowrap z-[100] pointer-events-none">
                                                                        {step.replace(/_/g, ' ')}
                                                                    </div>
                                                                </div>
                                                                {idx < arr.length - 1 && (
                                                                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-700 ${statusIndex > idx ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>

                                                <div className="flex items-center gap-3 w-full justify-end">
                                                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' ? (
                                                        <div className="flex gap-3">
                                                            {/* Intelligent Priority Action Button */}
                                                            {order.status === 'AWAITING_PAYMENT_APPROVAL' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order.id, 'PAYMENT_VERIFIED')}
                                                                    className="bg-emerald-600 hover:bg-black text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
                                                                >
                                                                    <DollarSign size={16} /> VERIFY FINANCIAL SLIP
                                                                </button>
                                                            )}
                                                            { (order.status === 'PENDING' || order.status === 'PAYMENT_VERIFIED') && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order.id, 'PREPARED')}
                                                                    className="bg-blue-600 hover:bg-black text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 active:scale-95"
                                                                >
                                                                    <Package size={16} /> COMMENCE PACKAGING
                                                                </button>
                                                            )}
                                                            {order.status === 'PREPARED' && order.deliveryMethod === 'COURIER' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                                                    className="bg-purple-600 hover:bg-black text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2 active:scale-95"
                                                                >
                                                                    <Truck size={16} /> DISPATCH TO COURIER
                                                                </button>
                                                            )}
                                                            { (order.status === 'SHIPPED' || (order.status === 'PREPARED' && order.deliveryMethod === 'PICKUP')) && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                                                    className="bg-emerald-600 hover:bg-black text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
                                                                >
                                                                    <CheckCircle size={16} /> FINALIZE LIFECYCLE
                                                                </button>
                                                            )}
                                                            
                                                            <button
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="bg-rose-50 text-rose-600 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                            >
                                                                ABORT
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-[2rem] border border-slate-100">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                                {order.status === 'COMPLETED' ? <CheckCircle size={18} /> : <X size={18} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Final Outcome</p>
                                                                <p className={`font-black uppercase tracking-tighter ${order.status === 'COMPLETED' ? 'text-emerald-600' : 'text-rose-600'}`}>{order.status} LOGGED</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-8 py-6 border-y border-slate-50">
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordered Items</p>
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-sm font-bold text-slate-600">
                                                        <span>{item.supplement.name} x {item.quantity}</span>
                                                        <span>LKR {(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between text-sm font-bold text-slate-600">
                                                    <span>Items Subtotal</span>
                                                    <span>LKR {(order.totalPrice - (order.deliveryMethod === 'COURIER' ? 50 : 0)).toLocaleString()}</span>
                                                </div>
                                                {order.deliveryMethod === 'COURIER' && (
                                                    <div className="flex justify-between text-sm font-bold text-blue-600">
                                                        <span>Shipping Fee</span>
                                                        <span>LKR 50.00</span>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t border-slate-50 flex justify-between font-black text-slate-900">
                                                    <span>Total</span>
                                                    <span>LKR {order.totalPrice.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment & Delivery</p>
                                                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                        <CreditCard size={14} className="text-blue-500" />
                                                        <span>{order.paymentMethod === 'ONLINE_PAYMENT' ? 'Online Payment' : 'Cash on Pickup'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                        {order.deliveryMethod === 'COURIER' ? <Truck size={14} className="text-blue-500" /> : <Store size={14} className="text-blue-500" />}
                                                        <span>{order.deliveryMethod === 'COURIER' ? 'Courier Delivery' : 'In-Gym Pickup'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                        <Phone size={14} className="text-slate-400" />
                                                        <span>{order.contactNumber}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-xs font-bold text-slate-700">
                                                        <MapPin size={14} className="text-slate-400 shrink-0" />
                                                        <span className="leading-tight">{order.deliveryAddress}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Verification</p>
                                                {order.paymentSlip ? (
                                                    <div className="relative group cursor-pointer" onClick={() => setSelectedSlip(order.paymentSlip)}>
                                                        <img src={order.paymentSlip} alt="Payment Slip" className="w-full h-32 object-cover rounded-2xl border border-slate-200" />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                                            <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Eye size={14} /> View Slip</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300">
                                                        <p className="text-[10px] font-bold uppercase">No slip uploaded</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {order.deliveryMethod === 'PICKUP' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                                className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} /> Confirm Collected
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
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

            {/* Slip Preview Modal */}
            <AnimatePresence>
                {selectedSlip && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-10">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSlip(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative z-[210] max-w-4xl w-full h-full flex items-center justify-center">
                            <button onClick={() => setSelectedSlip(null)} className="absolute -top-4 -right-4 w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl hover:text-rose-600 transition-colors">
                                <X size={24} />
                            </button>
                            <img src={selectedSlip} alt="Slip Full View" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryStoreAdmin;

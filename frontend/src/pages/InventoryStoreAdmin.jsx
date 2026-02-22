import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { Store, Plus, Package, AlertCircle, TrendingUp, Trash2, Edit2, X, Image as ImageIcon, CheckCircle, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import AdminPageBanner from '../components/AdminPageBanner';

const InventoryStoreAdmin = () => {
    const [supplements, setSupplements] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ name: '', brand: '', price: '', stock: '', category: 'Protein', description: '', image: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showToast, setShowToast] = useState(false);
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

    useEffect(() => {
        fetchSupplements();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', brand: '', price: '', stock: '', category: 'Protein', description: '', image: '' });
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
            image: item.image || ''
        });
        setEditId(item.id);
        setIsEditing(true);
        setShowAdd(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Image size too large! Please choose an image under 2MB.");
                return;
            }

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
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
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
            alert("Operation failed");
            console.error(err);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/supplements/${deleteId}`, {
                headers: { Authorization: auth }
            });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            fetchSupplements();
        } catch (err) {
            alert("Delete failed");
            console.error(err);
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-slate-100">
            <AdminSidebar activePage="inventory" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <AdminPageBanner title="Inventory & Store" subtitle="Manage stock levels, pricing, and product catalog." icon={Store} />

                <div className="mb-8 flex justify-end">
                    <button onClick={() => { resetForm(); setShowAdd(true); }} className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                        <Plus size={20} /> Add Product
                    </button>
                </div>

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
                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Store Revenue</h3>
                        <p className="text-4xl font-black">$8,120</p>
                    </div>
                </div>

                {showAdd && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-10 relative">
                        <button onClick={() => setShowAdd(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
                        <h3 className="text-2xl font-black mb-8">{isEditing ? 'Edit Supplement' : 'New Supplement Details'}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <input type="text" placeholder="Product Name" className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" required value={formData.name} onChange={e => { const val = e.target.value; setFormData(prev => ({ ...prev, name: val })); }} />
                            <input type="text" placeholder="Brand" className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" required value={formData.brand} onChange={e => { const val = e.target.value; setFormData(prev => ({ ...prev, brand: val })); }} />
                            <input type="number" placeholder="Price ($)" className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" required value={formData.price} onChange={e => { const val = e.target.value; setFormData(prev => ({ ...prev, price: val })); }} />
                            <input type="number" placeholder="In Stock" className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" required value={formData.stock} onChange={e => { const val = e.target.value; setFormData(prev => ({ ...prev, stock: val })); }} />

                            <div className="col-span-full">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Product Image</label>
                                <div className="flex items-center gap-4">
                                    {formData.image && <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                </div>
                            </div>

                            <select className="col-span-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option>Protein</option>
                                <option>Creatine</option>
                                <option>Pre-Workout</option>
                                <option>Vitamins</option>
                                <option>Recovery</option>
                                <option>Mass Gainer</option>
                            </select>
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
                                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-black overflow-hidden relative">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Store size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-none mb-1">{item.name}</p>
                                                <p className="text-xs text-slate-400">{item.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-slate-600 font-bold text-sm bg-slate-100 px-3 py-1 rounded-lg">{item.category}</span>
                                    </td>
                                    <td className="px-8 py-6 font-black text-slate-900">${item.price}</td>
                                    <td className="px-8 py-6">
                                        <div className={`flex items-center gap-2 font-black text-xs ${item.stock < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            <div className={`w-2 h-2 rounded-full ${item.stock < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                            {item.stock} UNITS {item.stock < 10 && '(RE-ORDER)'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditClick(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {showToast && (
                <div className="fixed bottom-10 right-10 bg-white border-l-4 border-emerald-500 shadow-2xl rounded-2xl p-6 flex items-center gap-4 animate-in slide-in-from-right-10 fade-in duration-300 z-50">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">Success</h4>
                        <p className="text-slate-500 text-sm font-medium">Item deleted successfully from inventory.</p>
                    </div>
                    <button onClick={() => setShowToast(false)} className="ml-4 text-slate-400 hover:text-slate-900"><X size={18} /></button>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setShowDeleteModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <Trash2 size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Delete Product?</h3>
                        <p className="text-slate-500 text-center mb-8 font-medium">Are you sure you want to remove this product from the inventory? This action cannot be undone.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="py-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryStoreAdmin;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, User, Trash2, Shield, Crown, Dumbbell, Users, LayoutDashboard, CheckCircle, XCircle, Search } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const UserManagementPage = ({ role }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: role
    });
    const [isEditing, setIsEditing] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const rawAuth = localStorage.getItem('auth');
            if (!rawAuth) {
                navigate('/login');
                return;
            }
            const auth = JSON.parse(rawAuth);
            const endpoint = role === 'ADMIN' ? 'admins' : role === 'TRAINER' ? 'trainers' : 'members';
            const res = await axios.get(`http://localhost:8080/api/admin/${endpoint}`, {
                headers: { Authorization: auth }
            });
            setUsers(res.data);
            setError('');
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            } else {
                setError(`Failed to fetch users: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [role]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // 1. Name/Username Validation: No numbers allowed
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(formData.username)) {
            setError("Names/Usernames should only contain letters. Numbers are not allowed.");
            return;
        }

        // 2. Email Validation: Simple regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address (e.g. user@example.com).");
            return;
        }

        // 3. Password Validation: At least 6 characters
        // Only validate if it's a new user OR if the user is typing a new password while editing
        if (!isEditing || (isEditing && formData.password.length > 0)) {
            if (formData.password.length < 6) {
                setError("Security Alert: Password must be at least 6 characters long.");
                return;
            }
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const dataToSend = { ...formData, role: role };

            if (isEditing) {
                await axios.put(`http://localhost:8080/api/admin/users/${isEditing}`, dataToSend, {
                    headers: { Authorization: auth }
                });
                setMessage('User updated successfully');
            } else {
                await axios.post('http://localhost:8080/api/admin/add-user', dataToSend, {
                    headers: { Authorization: auth }
                });
                setMessage('User added successfully');
            }
            setFormData({ username: '', email: '', password: '', role: role });
            setIsEditing(null);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/admin/users/${id}/toggle-status`, {}, {
                headers: { Authorization: auth }
            });
            fetchUsers();
        } catch (err) {
            alert("Failed to change user status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
                headers: { Authorization: auth }
            });
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handleEdit = (user) => {
        setFormData({ username: user.username, email: user.email, password: '', role: user.role });
        setIsEditing(user.id);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth');
        navigate('/login');
    };

    const roleName = role.charAt(0) + role.slice(1).toLowerCase();
    const roleIcon = role === 'ADMIN' ? <Crown className="text-purple-500" /> : role === 'TRAINER' ? <Dumbbell className="text-blue-500" /> : <Users className="text-green-500" />;

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <Shield className="text-blue-500" />
                    <span className="text-xl font-bold">Admin Hub</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white">
                        <LayoutDashboard size={20} /> Overview
                    </Link>
                    <Link to="/admin/manage-admins" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${role === 'ADMIN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Crown size={20} /> Admins
                    </Link>
                    <Link to="/admin/manage-trainers" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${role === 'TRAINER' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Dumbbell size={20} /> Trainers
                    </Link>
                    <Link to="/admin/manage-members" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${role === 'MEMBER' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Users size={20} /> Members
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-3 rounded-xl transition-all font-bold">
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            {roleIcon}
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Manage {roleName}s</h1>
                    </div>
                </header>

                <div className="mb-8">
                    <div className="max-w-xl relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder={`Search ${roleName.toLowerCase()}s by username...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Form Section */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 col-span-1 border-b-4 border-blue-500">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            {isEditing ? <Edit2 size={20} className="text-blue-500" /> : <UserPlus size={20} className="text-blue-500" />}
                            {isEditing ? `Edit ${roleName}` : `Add New ${roleName}`}
                        </h2>
                        {message && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium"> <CheckCircle size={16} /> {message}</div>}
                        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider">Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="Enter username" required autoComplete="off" />
                            </div>
                            <div>
                                <label className="block text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="email@example.com" required autoComplete="off" />
                            </div>
                            <div>
                                <label className="block text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider">Password {isEditing && '(Leave blank to keep)'}</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="••••••••" required={!isEditing} autoComplete="new-password" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                    {isEditing ? 'Save Changes' : `Create ${roleName}`}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={() => { setIsEditing(null); setFormData({ username: '', email: '', password: '', role: role }); }} className="px-6 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-bold transition-all active:scale-95">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>

                    {/* List Section */}
                    <div className="col-span-1 lg:col-span-2 space-y-4">
                        {users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                            <motion.div layout key={user.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-2xl ${role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : role === 'TRAINER' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{user.username}</h4>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <MailIcon size={14} /> {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end mr-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${user.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {user.isActive ? 'Access Granted' : 'Access Revoked'}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleStatus(user.id)} 
                                        title={user.isActive ? "Deactivate User" : "Activate User"}
                                        className={`p-3 rounded-2xl transition-all ${user.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-400 hover:bg-red-50'}`}
                                    >
                                        {user.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </button>
                                    <button onClick={() => handleDelete(user.id)} title="Delete User" className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {users.length === 0 && !loading && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-medium">No {roleName.toLowerCase()}s found in the system.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const MailIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;

export default UserManagementPage;

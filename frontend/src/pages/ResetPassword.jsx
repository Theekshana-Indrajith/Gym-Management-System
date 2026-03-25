import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, X, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ token: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match!' });
            setLoading(false);
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', {
                token: formData.token,
                newPassword: formData.newPassword
            });
            setStatus({ type: 'success', message: 'Password reset successful! Redirecting...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data || 'Reset failed. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative px-4">
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[3rem] shadow-2xl w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-emerald-600/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <ShieldCheck className="text-emerald-400" size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-3">Reset Authentication</h2>
                    <p className="text-slate-400 font-medium px-8">
                        Enter your secure token and create a master password.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {status.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-8 p-5 rounded-3xl border flex items-center gap-4 ${
                                status.type === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' 
                                : 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                            }`}
                        >
                            {status.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                            <span className="text-sm font-bold uppercase tracking-wide">{status.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest ml-1">Secure Reset Token</label>
                        <div className="relative group">
                            <RefreshCw className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                            <input
                                name="token"
                                value={formData.token}
                                onChange={handleChange}
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl py-5 pl-14 pr-5 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all font-mono text-sm tracking-widest"
                                placeholder="Paste token here..."
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-slate-400 text-xs font-black uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl py-5 pl-14 pr-5 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-slate-400 text-xs font-black uppercase tracking-widest ml-1">Confirm Master</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl py-5 pl-14 pr-5 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-blue-700 text-white font-black py-5 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-lg uppercase tracking-tight disabled:opacity-50 group mt-4"
                    >
                        {loading ? (
                            <RefreshCw className="animate-spin" size={24} />
                        ) : (
                            <>
                                Update Password
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-12 text-center border-t border-white/5 pt-8">
                    <p className="text-slate-500 text-sm font-medium mb-4">Secured with RSA-256 standard encryption</p>
                    <Link to="/login" className="text-blue-400 hover:text-white transition-colors text-sm font-black uppercase tracking-widest inline-flex items-center gap-2">
                        ← Exit to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;

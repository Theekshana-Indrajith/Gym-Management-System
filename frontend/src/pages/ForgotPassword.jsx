import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, X, CheckCircle, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setStatus({ 
                type: 'success', 
                message: 'Recovery email sent! Check your inbox for the token.' 
            });
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data || 'Failed to process request. Please try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative px-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10"
            >
                <Link
                    to="/login"
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                    <X size={20} />
                </Link>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                        <RefreshCw className="text-blue-400" size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3">Forgot Password?</h2>
                    <p className="text-slate-400 text-sm leading-relaxed px-4">
                        Enter your email address and we'll help you reset your access.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {status.message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${
                                status.type === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200' 
                                : 'bg-rose-500/10 border-rose-500/50 text-rose-200'
                            }`}
                        >
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-sm font-medium">{status.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-widest mb-3 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <RefreshCw className="animate-spin" size={20} />
                        ) : (
                            <>
                                Send Reset Token
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </>
                        )}
                    </button>
                </form>

                {status.type === 'success' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 pt-8 border-t border-white/10"
                    >
                        <Link 
                            to="/reset-password" 
                            className="w-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl hover:bg-emerald-600/30 transition-all flex items-center justify-center gap-2 group"
                        >
                            <KeyRound size={18} />
                            Go to Reset Password
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </Link>
                    </motion.div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        ← Back to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;

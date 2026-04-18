import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, X, ChevronRight, Dumbbell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', formData);
            if (response.status === 200) {
                const user = response.data;
                localStorage.setItem('user', JSON.stringify(user));

                const authHeader = 'Basic ' + btoa(`${formData.username}:${formData.password}`);
                localStorage.setItem('auth', JSON.stringify(authHeader));

                if (user.role === 'ADMIN') {
                    navigate('/admin-dashboard');
                } else if (user.role === 'TRAINER') {
                    navigate('/trainer-dashboard');
                } else if (user.role === 'TECHNICIAN') {
                    navigate('/technician-dashboard');
                } else {
                    navigate('/member-dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] overflow-hidden relative">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 text-white">
                <img 
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
                    className="w-full h-full object-cover opacity-30 grayscale scale-105"
                    alt="Gym Background"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#020617]/80 to-transparent"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 m-4"
            >
                {/* Left Side - Visual Branding */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 relative overflow-hidden text-white">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    </div>

                    <div>
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-3 mb-8"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-12">
                                <Dumbbell className="text-white -rotate-12" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">MuscleHub</h1>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                                Transform with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 italic">AI Precision</span>
                            </h2>
                            <p className="text-slate-400 text-lg max-w-sm mb-8 leading-relaxed">
                                Join the next generation of gym management with automated tracking and pro advice.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Workouts', val: '5k+' },
                            { label: 'Members', val: '12k' },
                            { label: 'Success', val: '98%' }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 + (i * 0.1) }}
                            >
                                <p className="text-2xl font-bold text-white leading-none">{stat.val}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-semibold">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-[#020617]/40 text-white">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Login</h3>
                            <p className="text-slate-400">Welcome back! Please enter your details.</p>
                        </div>
                        <Link
                            to="/"
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </Link>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2 overflow-hidden"
                            >
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="your_username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm px-1">
                            <label className="flex items-center text-slate-400 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="mr-2 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-0" />
                                Stay logged in
                            </label>
                            <Link to="/forgot-password" size="sm" className="text-slate-400 hover:text-blue-400 transition-colors font-medium">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Log In to Dashboard
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-slate-500 text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-500 font-bold hover:text-blue-400 transition-colors inline-flex items-center gap-1 group">
                            Create Account
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

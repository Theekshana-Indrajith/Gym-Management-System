import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, X, Phone, Users, Calendar, ChevronRight, Dumbbell, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        age: '',
        gender: '',
        phoneNumber: '',
        role: 'MEMBER',
        verificationCode: ''
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpSending, setIsOtpSending] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            setError('Please enter your email first.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please provide a valid email address.');
            return;
        }

        setError('');
        setIsOtpSending(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/send-otp', { email: formData.email });
            setOtpSent(true);
            setSuccessMsg('Verification code sent! Please check your inbox.');
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            setError(err.response?.data || 'Failed to send OTP. Try again.');
        } finally {
            setIsOtpSending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.username || !formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.age || !formData.gender || !formData.phoneNumber || !formData.verificationCode) {
            setError('All fields including verification code are required.');
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please provide a valid email address.');
            setIsLoading(false);
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            setError('Phone Number must be exactly 10 digits.');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', formData);
            if (response.status === 200) {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] overflow-hidden relative py-12 px-4">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop" 
                    className="w-full h-full object-cover opacity-20 grayscale scale-110"
                    alt="Gym Atmosphere"
                />
                <div className="absolute inset-0 bg-gradient-to-bl from-[#020617] via-[#020617]/90 to-transparent"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[1100px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 grid lg:grid-cols-[1fr_1.5fr]"
            >
                {/* Left Side - Info */}
                <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-tr from-blue-600/20 to-indigo-700/20 border-r border-white/10">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center rotate-12">
                                <Dumbbell className="text-white -rotate-12" size={20} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">MuscleHub</h1>
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Join the <span className="text-blue-500 italic">Evolution</span></h2>
                        
                        <div className="space-y-6 mt-12">
                            {[
                                { title: 'AI Driven Plans', desc: 'Personalized workout and diet optimizations.', icon: ShieldCheck },
                                { title: 'Expert Guidance', desc: 'Connect with pro trainers and athletes.', icon: Users },
                                { title: 'Real-time Stats', desc: 'Monitor every metric of your fitness journey.', icon: ArrowRight }
                            ].map((feature, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="flex gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="text-blue-500" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                                        <p className="text-slate-400 text-xs">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mt-auto">
                        <p className="text-slate-400 text-xs italic leading-relaxed">
                            "Motivation is what gets you started. Habit is what keeps you going. Join MuscleHub today."
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 lg:p-12 bg-[#020617]/40 overflow-y-auto max-h-[90vh] custom-scrollbar text-white">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">Create Account</h3>
                            <p className="text-slate-400 mt-1 text-sm text-balance">Join thousands of members on their transformation journey.</p>
                        </div>
                        <Link to="/" className="text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </Link>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-xs flex items-center gap-3"
                            >
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                {error}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-2xl mb-6 text-xs flex items-center gap-3"
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm shadow-sm font-medium"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm shadow-sm font-medium"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm shadow-sm font-medium"
                                    placeholder="muscle_warrior"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="flex gap-2">
                                <div className="relative group flex-1">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm shadow-sm font-medium disabled:bg-slate-100 disabled:text-slate-500"
                                        placeholder="john@example.com"
                                        required
                                        disabled={otpSent}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpSent || isOtpSending}
                                    className="px-6 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 transition-all text-sm font-bold whitespace-nowrap"
                                >
                                    {isOtpSending ? 'Sending...' : (otpSent ? 'Sent' : 'Verify')}
                                </button>
                            </div>
                        </div>

                        {otpSent && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-1.5 pt-1"
                            >
                                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-1 animate-pulse">Enter Verification Code</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                    <input
                                        type="text"
                                        name="verificationCode"
                                        value={formData.verificationCode}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-blue-200 rounded-2xl py-3.5 pl-12 pr-4 text-blue-900 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono tracking-[0.5em] text-lg shadow-sm font-bold"
                                        placeholder="••••••"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 ml-1">Need a new code? Refresh the page or wait 10 mins.</p>
                            </motion.div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm font-mono shadow-sm font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Age</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm shadow-sm font-medium"
                                        placeholder="24"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Gender</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm appearance-none shadow-sm font-medium"
                                        required
                                    >
                                        <option value="" disabled className="bg-[#1a1a1c]">Select</option>
                                        <option value="Male" className="bg-[#1a1a1c]">Male</option>
                                        <option value="Female" className="bg-[#1a1a1c]">Female</option>
                                        <option value="Other" className="bg-[#1a1a1c]">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 pb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm shadow-sm font-medium"
                                    placeholder="0712345678"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Complete Registration
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-slate-500 text-sm">
                        Already part of the tribe?{' '}
                        <Link to="/login" className="text-blue-500 font-bold hover:text-blue-400 transition-colors">
                            Log in
                        </Link>
                    </div>
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}} />
        </div>
    );
};

export default Signup;

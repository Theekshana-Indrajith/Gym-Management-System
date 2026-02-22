import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ShieldAlert, Clock, Sparkles, ArrowRight, DollarSign, Share, ChevronLeft, Home } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MembershipSelection = () => {
    const [packages, setPackages] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentRef, setPaymentRef] = useState('');
    const [slipFile, setSlipFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const auth = JSON.parse(localStorage.getItem('auth'));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pkgRes, profRes] = await Promise.all([
                axios.get('http://localhost:8080/api/membership/packages', { headers: { Authorization: auth } }),
                axios.get('http://localhost:8080/api/member/profile', { headers: { Authorization: auth } })
            ]);
            setPackages(pkgRes.data);
            setProfile(profRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!selectedPackage || !slipFile) {
            alert("Please upload your payment slip to continue.");
            return;
        }
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('packageId', selectedPackage.id);
        formData.append('paymentRef', paymentRef);
        formData.append('slip', slipFile);

        try {
            await axios.post('http://localhost:8080/api/membership/subscribe', formData, {
                headers: {
                    Authorization: auth,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Subscription request sent! Please wait for admin approval.");
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to subscribe");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (profile?.membershipStatus === 'PENDING') {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100 relative">
                <main className="flex-1 p-10 flex items-center justify-center">
                    <div className="absolute top-10 left-10">
                        <button onClick={() => navigate('/member-dashboard')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                            <ChevronLeft size={20} /> Dashboard
                        </button>
                    </div>
                    <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                            <Clock size={200} />
                        </div>
                        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600">
                            <Clock size={48} className="animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">Verification Pending</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
                            We've received your request for the <span className="text-blue-600 font-black">"{profile.activePackageName || 'Membership'}"</span> plan.
                            Our team is currently verifying your payment reference.
                        </p>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 inline-block mb-10">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-blue-600 font-bold">Awaiting Admin Approval</p>
                        </div>
                        <p className="text-slate-400 text-sm italic">You'll gain full access to the gym system once approved.</p>
                    </div>
                </main>
            </div>
        );
    }

    if (profile?.membershipStatus === 'ACTIVE') {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100 relative">
                <main className="flex-1 p-10 flex items-center justify-center">
                    <div className="absolute top-10 left-10">
                        <button onClick={() => navigate('/member-dashboard')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                            <ChevronLeft size={20} /> Dashboard
                        </button>
                    </div>
                    <div className="max-w-2xl w-full bg-slate-900 rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden text-white">
                        <Sparkles className="absolute left-[-5%] top-[-5%] text-white/5 w-64 h-64" />
                        <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-emerald-500/20">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">Subscription Active</h2>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
                            You are currently on the <span className="text-emerald-400 font-black">"{profile.activePackageName}"</span> plan.
                            Enjoy your full access to workouts, diets, and personal trainers!
                        </p>
                        <button
                            onClick={() => window.location.href = '/member-dashboard'}
                            className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100 relative">
            <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-100 mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                        <CreditCard size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">MuscleHub <span className="text-blue-600">Pro</span></span>
                </div>
                <button onClick={() => navigate('/member-dashboard')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                    <Home size={18} /> Back to Dashboard
                </button>
            </nav>
            <main className="p-10">
                <header className="mb-12 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        <CreditCard size={14} /> Join the Elite
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">Unlock Your Potential</h1>
                    <p className="text-slate-500 font-medium text-lg">Choose a membership plan to access personalized training, AI insights, and professional guidance.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {packages.map(pkg => (
                        <div
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg)}
                            className={`p-10 rounded-[3rem] border-2 transition-all cursor-pointer relative overflow-hidden group ${selectedPackage?.id === pkg.id
                                ? 'bg-slate-900 border-blue-600 shadow-2xl scale-105 z-10 text-white'
                                : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}
                        >
                            {selectedPackage?.id === pkg.id && (
                                <div className="absolute top-0 right-0 p-6 text-blue-500">
                                    <CheckCircle2 size={32} />
                                </div>
                            )}
                            <h3 className={`text-2xl font-black mb-1 uppercase ${selectedPackage?.id === pkg.id ? 'text-white' : 'text-slate-900'}`}>{pkg.name}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className={`text-4xl font-black ${selectedPackage?.id === pkg.id ? 'text-blue-500' : 'text-blue-600'}`}>${pkg.price}</span>
                                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">/ {pkg.durationMonths} Months</span>
                            </div>
                            <p className={`text-sm font-medium mb-8 leading-relaxed ${selectedPackage?.id === pkg.id ? 'text-slate-400' : 'text-slate-500'}`}>
                                {pkg.description || 'Full access to gym facilities and basic features.'}
                            </p>
                            <div className="space-y-4">
                                {['Personalized Workouts', 'AI Progress Tracking', 'Trainer Sessions'].map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedPackage?.id === pkg.id ? 'bg-blue-900 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            <CheckCircle2 size={14} />
                                        </div>
                                        <span className={`text-sm font-bold ${selectedPackage?.id === pkg.id ? 'text-slate-300' : 'text-slate-600'}`}>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedPackage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Selected Plan</p>
                                <h4 className="text-2xl font-black text-slate-900 uppercase">{selectedPackage.name}</h4>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
                                <p className="text-3xl font-black text-blue-600">${selectedPackage.price}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubscribe} className="space-y-6">
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-8 flex items-start gap-4">
                                <ShieldAlert className="text-blue-600 shrink-0 mt-1" size={20} />
                                <div className="text-sm text-blue-900 font-medium leading-relaxed">
                                    <p className="font-black mb-1">MANDATORY:</p>
                                    <p>Please upload your <span className="font-black">Payment Receipt/Slip</span> image below. The Transaction ID is optional but recommended if available.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-4">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Payment Reference ID</label>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Optional</span>
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all text-center text-lg placeholder:text-slate-300"
                                    placeholder="e.g. TXN98765432"
                                    value={paymentRef}
                                    onChange={e => setPaymentRef(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 italic block">Upload Payment Slip (Screenshot/Image)</label>
                                <div className="relative group/file">
                                    <input
                                        type="file"
                                        required
                                        accept="image/*"
                                        onChange={e => setSlipFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all ${slipFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 group-hover/file:border-blue-400 bg-slate-50/50'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${slipFile ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                                            <Share className={slipFile ? '' : 'animate-bounce'} size={20} />
                                        </div>
                                        <p className={`text-sm font-bold ${slipFile ? 'text-emerald-700' : 'text-slate-500'}`}>
                                            {slipFile ? slipFile.name : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Confirm Subscription'} <ArrowRight size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default MembershipSelection;

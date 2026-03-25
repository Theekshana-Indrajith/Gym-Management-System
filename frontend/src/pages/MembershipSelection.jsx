import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, ShieldAlert, Clock, Sparkles, ArrowRight, Share, ChevronLeft, Home, LogOut, AlertTriangle } from 'lucide-react';
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
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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

    const handleCancelMembership = async () => {
        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:8080/api/membership/cancel', {}, {
                headers: { Authorization: auth }
            });
            alert("Membership cancelled successfully.");
            setShowCancelConfirm(false);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to cancel membership");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col min-h-screen bg-slate-900 items-center justify-center font-sans">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    // Common Footer Component
    const Footer = () => (
        <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center relative z-20">
            <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 border-b border-slate-800 pb-8 text-center md:text-left">
                <div className="flex flex-col gap-4 items-center md:items-start max-w-[200px]">
                    <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                        <div className="text-white bg-blue-600 p-1 rounded min-w-[32px] min-h-[32px] flex items-center justify-center font-black">MH</div> MUSCLEHUB
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 text-[11px]">
                    {['About Us', 'Services', 'Contact', 'Privacy Policy'].map(title => (
                        <div key={title}>
                            <h4 className="text-white font-bold mb-4 text-[13px]">{title}</h4>
                            <p className="opacity-60">Professional gym and fitness management system.</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] mt-8 text-slate-600 gap-4 font-semibold tracking-wide">
                <p>&copy; 2026 MuscleHub. All rights reserved.</p>
                <p>Colombo, Sri Lanka <span className="mx-2 hidden md:inline">|</span> 011-2224455</p>
            </div>
        </footer>
    );

    if (profile?.membershipStatus === 'PENDING') {
        return (
            <div className="flex flex-col min-h-screen bg-slate-100 relative font-sans">
                <main className="flex-1 p-10 flex flex-col items-center justify-center">
                    <div className="absolute top-10 left-10">
                        <button onClick={() => navigate('/member-dashboard')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                            <ChevronLeft size={20} /> Dashboard
                        </button>
                    </div>
                    <div className="max-w-2xl w-full bg-white rounded-[4rem] p-12 text-center shadow-2xl border border-slate-100 relative overflow-hidden mb-12">
                        <Clock size={48} className="mx-auto mb-8 text-blue-600 animate-pulse" />
                        <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight uppercase">Verification Pending</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
                            Your request for <span className="text-blue-600 font-bold">"{profile.activePackageName}"</span> is being reviewed by our team.
                        </p>
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-10">
                            <p className="text-blue-600 font-bold tracking-widest uppercase text-sm">Awaiting Admin Approval</p>
                        </div>
                        <button 
                            onClick={() => setShowCancelConfirm(true)}
                            className="text-slate-400 hover:text-red-500 font-bold text-sm underline transition-colors"
                        >
                            Cancel Request
                        </button>
                    </div>
                </main>
                <Footer />

                <AnimatePresence>
                    {showCancelConfirm && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl">
                                <AlertTriangle className="text-red-500 w-12 h-12 mb-4 mx-auto" />
                                <h3 className="text-xl font-bold text-slate-900 text-center mb-2 uppercase">Cancel Request?</h3>
                                <p className="text-slate-500 text-center text-sm mb-8 font-medium italic">This will remove your pending membership application.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setShowCancelConfirm(false)} className="py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Go Back</button>
                                    <button onClick={handleCancelMembership} className="py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Yes, Cancel</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }


    return (
        <div className="flex flex-col min-h-screen bg-slate-100 relative font-sans">
            <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-200 mb-10 w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                        <CreditCard size={20} />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tighter uppercase">Membership <span className="text-blue-600">Hub</span></span>
                </div>
                <button onClick={() => navigate('/member-dashboard')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                    <Home size={18} /> Dashboard
                </button>
            </nav>

            <main className="p-10 flex-1">
                {profile?.membershipStatus === 'ACTIVE' && (
                    <section className="mb-20 max-w-6xl mx-auto">
                        <div className="bg-slate-900 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-10">
                            <Sparkles className="absolute left-[-5%] top-[-10%] text-white/5 w-64 h-64" />
                            <div className="relative z-10 text-center md:text-left">
                                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full">Active Recruit</span>
                                </div>
                                <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">Current Legacy</h2>
                                <p className="text-slate-400 font-bold text-xl italic">
                                    You are deployed on the <span className="text-emerald-400">"{profile.activePackageName}"</span> elite plan.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
                                <button 
                                    onClick={() => setShowCancelConfirm(true)} 
                                    className="bg-slate-800 text-white/60 px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-3 text-xs shadow-xl min-w-[200px] justify-center"
                                >
                                    <LogOut size={18} /> Leave Legacy Plan
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                <header className="mb-12 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Sparkles size={14} className="text-blue-500" /> Premium Fitness
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Available Protocols</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl mx-auto">
                        {profile?.membershipStatus === 'ACTIVE' 
                            ? "Explore other elite tiers. You must leave your current legacy to switch protocols."
                            : "Join the premium community of athletes. Select a plan to start your transformation with LKR pricing."}
                    </p>
                </header>

                <div className={`grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16 px-4 ${profile?.membershipStatus === 'ACTIVE' ? 'opacity-80' : ''}`}>
                    {packages.map(pkg => {
                        const isActivePlan = profile?.membershipStatus === 'ACTIVE' && profile?.activePackageId === pkg.id;
                        return (
                            <div
                                key={pkg.id}
                                onClick={() => {
                                    if (profile?.membershipStatus === 'ACTIVE') {
                                        alert("Active Mission: You must leave your current protocol before initiating a new one.");
                                        return;
                                    }
                                    setSelectedPackage(pkg);
                                }}
                                className={`p-10 rounded-[3.5rem] border-2 transition-all cursor-pointer relative overflow-hidden group ${selectedPackage?.id === pkg.id
                                    ? 'bg-slate-900 border-blue-600 shadow-2xl scale-[1.03] z-10 text-white'
                                    : 'bg-white border-slate-100/80 hover:border-blue-200 shadow-sm hover:translate-y-[-4px]'} 
                                    ${profile?.membershipStatus === 'ACTIVE' && !isActivePlan ? 'grayscale-[0.5] hover:border-red-200' : ''}`}
                            >
                                {(selectedPackage?.id === pkg.id || isActivePlan) && (
                                    <div className={`absolute top-10 right-10 ${isActivePlan ? 'text-emerald-500' : 'text-blue-500'}`}>
                                        <CheckCircle2 size={32} />
                                    </div>
                                )}
                                <h3 className={`text-2xl font-black mb-1 uppercase tracking-tight italic ${selectedPackage?.id === pkg.id || isActivePlan ? (isActivePlan ? 'text-emerald-400' : 'text-white') : 'text-slate-900'}`}>
                                    {pkg.name} {isActivePlan && <span className="text-[10px] ml-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 not-italic">CURRENT</span>}
                                </h3>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className={`text-4xl font-black ${selectedPackage?.id === pkg.id ? 'text-blue-400' : 'text-blue-600'}`}>LKR {pkg.price}</span>
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest opacity-60">/ {pkg.durationMonths} Months</span>
                            </div>
                            <div className="space-y-4 mb-8">
                                {['AI Workout Mapping', 'Pro Trainer Access', 'Meal Optimization'].map((feat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 size={16} className={selectedPackage?.id === pkg.id ? 'text-blue-400' : 'text-blue-600'} />
                                        <span className={`text-sm font-bold ${selectedPackage?.id === pkg.id ? 'text-slate-300' : 'text-slate-600'}`}>{feat}</span>
                                    </div>
                                ))}
                            </div>
                            <p className={`text-xs font-medium leading-relaxed italic ${selectedPackage?.id === pkg.id ? 'text-slate-500' : 'text-slate-400'}`}>
                                {pkg.description || 'Full-scale premium gym features for professional athletes.'}
                            </p>
                                {isActivePlan && (
                                    <div className="mt-8 pt-8 border-t border-slate-100/10">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-relaxed">
                                            Deployment in progress. This protocol is currently active on your profile.
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {selectedPackage && profile?.membershipStatus !== 'ACTIVE' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto bg-white rounded-[4rem] p-12 shadow-2xl border border-slate-100 mb-12 relative">
                        <div className="mb-10 text-center">
                            <h4 className="text-3xl font-black text-slate-900 uppercase italic mb-2">{selectedPackage.name}</h4>
                            <p className="text-blue-600 font-black text-4xl">LKR {selectedPackage.price}</p>
                        </div>

                        <form onSubmit={handleSubscribe} className="space-y-8">
                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex items-start gap-4">
                                <ShieldAlert className="text-blue-600 shrink-0 mt-1" size={24} />
                                <div className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                    <p className="text-slate-900 font-black mb-2 uppercase">Official Verification:</p>
                                    <p>Please upload your bank transfer slip or payment receipt (PDF/IMG). Our staff will verify and activate your elite access within 24 hours.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 italic">Payment Ref (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-3xl px-10 py-6 font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all text-center text-xl placeholder:text-slate-200"
                                    placeholder="TXN-ID-8844"
                                    value={paymentRef}
                                    onChange={e => setPaymentRef(e.target.value)}
                                />
                            </div>

                            <div className="relative group/slip">
                                <input type="file" required accept="image/*" onChange={e => setSlipFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className={`w-full border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all ${slipFile ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 group-hover/slip:border-blue-400 bg-slate-50/40'}`}>
                                    <Share className={slipFile ? 'text-emerald-500' : 'text-slate-300'} size={24} />
                                    <p className={`text-sm font-black mt-3 ${slipFile ? 'text-emerald-600' : 'text-slate-500'}`}>{slipFile ? slipFile.name : 'Upload Payment Receipt'}</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-slate-900 text-white font-black py-7 rounded-[2rem] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Confirming...' : 'Submit Activation'} <ArrowRight size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </main>
            <AnimatePresence>
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border border-slate-100">
                            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mb-8 shadow-inner">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter italic">Deactivate Membership?</h3>
                            <p className="text-slate-500 font-medium mb-12 leading-relaxed italic">
                                By leaving this plan, you will lose all premium access immediately. You can reconnect with a new protocol at any time later.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowCancelConfirm(false)} className="py-6 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">Stay on Plan</button>
                                <button onClick={handleCancelMembership} disabled={isSubmitting} className="py-6 rounded-[2rem] font-black bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                                    {isSubmitting ? 'Processing...' : 'Yes, Leave Plan'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <Footer />
        </div>
    );
};

export default MembershipSelection;

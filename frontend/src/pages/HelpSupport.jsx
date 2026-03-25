import React, { useState } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import { HelpCircle, MessageSquare, Phone, Mail, Send, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const HelpSupport = () => {
    const [subject, setSubject] = useState('Feedback');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setLoading(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/member/inquiries', {
                subject,
                message
            }, { headers: { Authorization: auth } });
            alert("Your inquiry has been submitted! Our team will get back to you soon.");
            setMessage('');
        } catch (err) {
            alert("Failed to send inquiry. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <MemberSidebar activePage="support" />
            <main className="ml-64 flex-1 p-10">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Help & Support</h1>
                    <p className="text-slate-500 font-medium">We're here to assist you 24/7. Get in touch with our team.</p>
                </header>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl overflow-hidden relative">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
                                <MessageSquare className="text-blue-500" /> Send an Inquiry
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Subject</label>
                                    <select 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option>Trainer Issue</option>
                                        <option>Subscription & Billing</option>
                                        <option>Technical Problem</option>
                                        <option>Feedback</option>
                                        <option>Supplement Request</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Your Message</label>
                                    <textarea 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full p-6 rounded-[2rem] bg-slate-50 border border-slate-100 font-medium outline-none h-40 focus:ring-2 focus:ring-blue-500/20" 
                                        placeholder="Describe your issue in detail..."
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Inquiry</>}
                                </button>
                            </form>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                            <h3 className="text-2xl font-black mb-8">Contact Channels</h3>
                            <div className="space-y-6">
                                {[
                                    { icon: Phone, label: "Customer Helpline", value: "+1 (800) Muscle-Hub", sub: "Available 9AM - 8PM" },
                                    { icon: Mail, label: "Email Support", value: "support@musclehub.pro", sub: "Response time < 4 hours" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                                        <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-blue-600 transition-colors">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-blue-400 uppercase mb-1 tracking-widest">{item.label}</p>
                                            <p className="text-xl font-bold">{item.value}</p>
                                            <p className="text-slate-500 text-xs font-medium">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                            <h3 className="text-2xl font-black text-slate-900 mb-8">Common FAQ</h3>
                            <div className="space-y-4">
                                {[
                                    "How to reset my password?",
                                    "Redeeming loyalty points?",
                                    "Changing my assigned trainer?",
                                    "Accessing the AI meal plan?"
                                ].map((q, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                                        <span className="font-bold text-slate-700">{q}</span>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HelpSupport;

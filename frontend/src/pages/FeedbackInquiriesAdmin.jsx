import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { MessageSquare, Star, Reply, User, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const FeedbackInquiriesAdmin = () => {
    const [inquiries, setInquiries] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    const fetchInquiries = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/admin/inquiries', {
                headers: { Authorization: auth }
            });
            setInquiries(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredInquiries = inquiries.filter(i => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Requests') return i.subject === 'Supplement Request';
        if (activeTab === 'General') return i.subject !== 'Supplement Request';
        return true;
    }).sort((a, b) => b.id - a.id);

    useEffect(() => { fetchInquiries(); }, []);

    const submitReply = async () => {
        if (!replyText) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/admin/inquiries/${selectedId}/reply`, {
                reply: replyText
            }, { headers: { Authorization: auth } });
            alert("Official response sent!");
            setReplyText('');
            setSelectedId(null);
            fetchInquiries();
        } catch (err) { alert("Failed to send reply"); }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <AdminSidebar activePage="feedback" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <AdminHeader title="" subtitle="Global inbox for member concerns and gym reviews." lightTheme={true} />

                        <div className="mt-8 mb-4">
                            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-emerald-400/30 rounded">MUSCLEHUB</span>
                            </div>
                            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Feedback & Support</h2>
                            <p className="text-slate-300 font-medium">Respond to inquiries and maintain member satisfaction.</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full relative z-20 mt-6 flex gap-8">
                    <div className="flex-1">
                        <div className="grid grid-cols-2 gap-6 mb-10">
                            {/* <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group cursor-pointer hover:shadow-xl transition-all">
                                <div>
                                    <h4 className="font-black text-slate-900 leading-none mb-1">Average Review</h4>
                                    <p className="text-4xl font-black text-blue-600">4.8 <span className="text-xs text-slate-400">/ 5</span></p>
                                </div>
                                <div className="flex text-blue-100 group-hover:text-amber-400 transition-colors">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill="currentColor" />)}
                                </div>
                            </div> */}
                            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex justify-between items-center relative overflow-hidden">
                                <div className="absolute right-[-10%] bottom-[-20%] opacity-20">
                                    <Clock size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-2">Pending Inquiries</h4>
                                    <p className="text-4xl font-black text-emerald-400">{inquiries.filter(i => i.status === 'OPEN').length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                            {[
                                { id: 'All', label: 'All Messages' },
                                { id: 'Requests', label: 'Supplement Requests' },
                                { id: 'General', label: 'General Inquiries' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {filteredInquiries.length === 0 ? (
                                <div className="bg-white p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center text-slate-400 font-bold italic">
                                    <CheckCircle size={48} className="mx-auto mb-4 opacity-50 text-blue-500" />
                                    No {activeTab.toLowerCase()} inquiries found.
                                </div>
                            ) : filteredInquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    onClick={() => setSelectedId(inquiry.id)}
                                    className={`p-6 bg-white rounded-3xl border transition-all cursor-pointer flex justify-between items-center ${selectedId === inquiry.id ? 'border-blue-500 shadow-xl scale-[1.02] ring-2 ring-blue-500 ring-opacity-50' : 'border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-full ${inquiry.status === 'OPEN' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black text-slate-900 text-lg">{inquiry.subject}</h4>
                                                {inquiry.subject === 'Supplement Request' && (
                                                    <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Stock Alert</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                From: <span className="text-blue-600">{inquiry.senderName || (inquiry.username ? `@${inquiry.username}` : 'Guest')}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${inquiry.status === 'OPEN' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {inquiry.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="w-[450px] bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 h-fit sticky top-10 flex flex-col min-h-[500px]">
                        {selectedId ? (
                            <>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4 border-b-2 border-slate-100 pb-4">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                                            <User size={24} />
                                        </div>
                                        Detailed Case
                                    </h3>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 max-h-48 overflow-y-auto w-full relative group">
                                        <MessageSquare size={100} className="absolute right-0 top-0 text-slate-900/5 -rotate-12 translate-x-4 -translate-y-4" />
                                        <p className="text-slate-600 font-medium italic leading-relaxed relative z-10">
                                            "{inquiries.find(i => i.id === selectedId)?.message}"
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black w-full block text-slate-400 uppercase tracking-widest ml-4">Official Reply</label>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Enter management response here..."
                                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl h-48 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                                <button
                                    onClick={submitReply}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black shadow-xl mt-8 flex items-center justify-center gap-2 transition-all active:scale-95 text-lg"
                                >
                                    <Reply size={20} /> Send Response
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 h-full py-20">
                                <MessageSquare size={80} className="mb-6 text-slate-500" />
                                <p className="font-black text-xl text-slate-600">Select an Inquiry</p>
                                <p className="font-medium text-slate-500 text-sm mt-2">Click on any message to view details and reply.</p>
                            </div>
                        )}
                    </aside>
                </div>

                <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center relative z-20">
                    <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 border-b border-slate-800 pb-8">
                        <div className="flex flex-col gap-4 max-w-[200px]">
                            <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                                <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center">
                                    <CheckCircle size={20} className="text-white" />
                                </div>
                                MUSCLEHUB
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
                                <span className="font-bold text-[10px]">FB</span>
                            </button>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors text-slate-400">
                                <span className="font-bold text-[10px]">X</span>
                            </button>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors text-slate-400">
                                <span className="font-bold text-[10px]">IG</span>
                            </button>
                        </div>
                    </div>
                    <div className="max-w-7xl w-full mx-auto flex justify-between items-center text-[10px] mt-8 text-slate-600 font-semibold tracking-wide">
                        <p>&copy; 2026 MuscleHub. All rights reserved.</p>
                        <p>Colombo, Sri Lanka <span className="mx-2">|</span> 011-2224455</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default FeedbackInquiriesAdmin;

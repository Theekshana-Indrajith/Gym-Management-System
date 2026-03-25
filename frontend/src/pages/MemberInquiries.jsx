import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import { MessageSquare, Send, User, ChevronRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const MemberInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchInquiries = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/trainer/inquiries', {
                headers: { Authorization: auth }
            });
            setInquiries(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const submitReply = async () => {
        if (!replyText) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post(`http://localhost:8080/api/trainer/inquiries/${selectedId}/reply`, {
                reply: replyText
            }, { headers: { Authorization: auth } });
            alert("Reply sent!");
            setReplyText('');
            setSelectedId(null);
            fetchInquiries();
        } catch (err) {
            alert("Failed to send reply");
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <TrainerSidebar activePage="inquiries" />
            <main className="ml-64 flex-1 p-10 flex gap-10">
                <div className="flex-1">
                    <header className="mb-10">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Member Inquiries</h1>
                        <p className="text-slate-500 font-medium">Respond to member concerns and health questions.</p>
                    </header>

                    <div className="space-y-4">
                        {inquiries.map((inquiry) => (
                            <div
                                key={inquiry.id}
                                onClick={() => setSelectedId(inquiry.id)}
                                className={`p-6 bg-white rounded-3xl border transition-all cursor-pointer flex justify-between items-center group ${selectedId === inquiry.id ? 'border-emerald-500 shadow-lg' : 'border-slate-100 shadow-sm hover:border-emerald-200'}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{inquiry.subject}</h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">From: {inquiry.user.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${inquiry.status === 'OPEN' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {inquiry.status}
                                    </span>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                        {inquiries.length === 0 && (
                            <p className="text-center py-20 text-slate-400 font-bold italic">No inquiries assigned to you.</p>
                        )}
                    </div>
                </div>

                <aside className="w-[450px] bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 sticky top-10 h-fit min-h-[600px] flex flex-col">
                    {selectedId ? (
                        <>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500 text-white rounded-lg"><User size={16} /></div>
                                    Inquiry Detail
                                </h3>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                                    <p className="text-slate-600 font-medium italic leading-relaxed">
                                        "{inquiries.find(i => i.id === selectedId)?.message}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Response</label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your professional advice here..."
                                        className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl h-64 outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                    ></textarea>
                                </div>
                            </div>
                            <button
                                onClick={submitReply}
                                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black shadow-xl mt-8 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Send size={20} /> Submit Expert Reply
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 px-10">
                            <MessageSquare size={64} className="mb-4" />
                            <p className="font-bold">Select an inquiry from the list to see details and provide a response.</p>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
};

export default MemberInquiries;

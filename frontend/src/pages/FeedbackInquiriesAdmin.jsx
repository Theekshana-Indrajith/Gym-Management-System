import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import { MessageSquare, Star, Reply, User, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const FeedbackInquiriesAdmin = () => {
    const [inquiries, setInquiries] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [replyText, setReplyText] = useState('');

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
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar activePage="feedback" />
            <main className="ml-64 flex-1 p-10 flex gap-8">
                <div className="flex-1">
                    <header className="mb-10">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Feedback & Support</h1>
                        <p className="text-slate-500 font-medium">Global inbox for member concerns and gym reviews.</p>
                    </header>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl flex justify-between items-center group cursor-pointer hover:border-blue-200 transition-all">
                            <div>
                                <h4 className="font-black text-slate-900 leading-none mb-1">Average Review</h4>
                                <p className="text-4xl font-black text-blue-600">4.8 <span className="text-xs text-slate-400">/ 5</span></p>
                            </div>
                            <div className="flex text-blue-100 group-hover:text-blue-500 transition-colors">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill="currentColor" />)}
                            </div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-2">Pending Inquiries</h4>
                                <p className="text-4xl font-black">{inquiries.filter(i => i.status === 'OPEN').length}</p>
                            </div>
                            <Clock size={40} className="text-blue-500 opacity-50" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {inquiries.map((inquiry) => (
                            <div
                                key={inquiry.id}
                                onClick={() => setSelectedId(inquiry.id)}
                                className={`p-6 bg-white rounded-3xl border transition-all cursor-pointer flex justify-between items-center ${selectedId === inquiry.id ? 'border-blue-500 shadow-xl scale-[1.02]' : 'border-slate-100 shadow-sm hover:border-blue-200'}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-2xl ${inquiry.status === 'OPEN' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900">{inquiry.subject}</h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">User: {inquiry.user.username}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase ${inquiry.status === 'OPEN' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {inquiry.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <aside className="w-[450px] bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 h-fit sticky top-10 flex flex-col min-h-[500px]">
                    {selectedId ? (
                        <>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black"><User size={20} /></div>
                                    Detailed Case
                                </h3>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 max-h-48 overflow-y-auto">
                                    <p className="text-slate-600 font-medium italic leading-relaxed">
                                        "{inquiries.find(i => i.id === selectedId)?.message}"
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Reply</label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Enter gym management response..."
                                        className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl h-64 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                    ></textarea>
                                </div>
                            </div>
                            <button
                                onClick={submitReply}
                                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black shadow-xl mt-8 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Reply size={20} /> Send Official Notice
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                            <MessageSquare size={64} className="mb-4" />
                            <p className="font-bold">Select a message to process.</p>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
};

export default FeedbackInquiriesAdmin;

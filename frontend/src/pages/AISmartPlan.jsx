import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MemberSidebar from '../components/MemberSidebar';
import MemberHeader from '../components/MemberHeader';
import MemberPageBanner from '../components/MemberPageBanner';
import { BrainCircuit, Sparkles, Utensils, Dumbbell, ArrowRight, Zap } from 'lucide-react';

const AISmartPlan = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const res = await axios.get('http://localhost:8080/api/member/profile', {
                    headers: { Authorization: auth }
                });

                if (res.data.membershipStatus !== 'ACTIVE') {
                    navigate('/member/membership');
                    return;
                }

                const planRes = await axios.get('http://localhost:8080/api/member/workout-plan', {
                    headers: { Authorization: auth }
                });
                setPlan(planRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [navigate]);

    const defaultPlans = [
        {
            title: "Expert Workout Strategy",
            content: plan?.workout || "Our AI recommends compound lifts (Bench, Squat, Deadlift) combined with 20 mins of steady state cardio. Focus on progressive overload 3x weekly.",
            icon: Dumbbell,
            color: "from-blue-600 to-indigo-700",
            source: plan?.workout ? "Trainer Assigned" : "AI Generated"
        },
        {
            title: "Advanced Nutrition Guide",
            content: plan?.diet || "Maintain a caloric surplus of 300kcal. Aim for 2.0g of protein per kg of bodyweight. Prioritize complex carbohydrates before training.",
            icon: Utensils,
            color: "from-emerald-600 to-teal-700",
            source: plan?.diet ? "Trainer Assigned" : "AI Generated"
        }
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100">
            <MemberSidebar activePage="smart-plan" />
            <main className="ml-64 flex-1 p-6">
                <MemberPageBanner title="AI Smart Plan" subtitle="Your personalized AI-powered fitness roadmap" icon={BrainCircuit} />

                <div className="max-w-5xl space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 flex items-start gap-8">
                            <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 shadow-inner">
                                <BrainCircuit size={40} className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">
                                    {plan ? "Custom Plan from Coach" : "Neural Analysis Complete"}
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    {plan
                                        ? "Your assigned trainer has reviewed your statistics and finalized a custom roadmap for your journey."
                                        : "Our AI has analyzed your weight logs and health data. We've adjusted your resting heart rate targets and recommended a new recovery protocol."
                                    }
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Zap size={16} />
                                        <span className="text-sm font-bold">Plan updated: {plan?.assignedDate || 'Just now'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {defaultPlans.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`bg-gradient-to-br ${p.color} rounded-[2.5rem] p-10 text-white shadow-xl flex flex-col justify-between h-fit min-h-[450px] border border-white/10`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                                            <p.icon size={32} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">{p.source}</span>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-6">{p.title}</h3>
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                                        <p className="text-white/80 text-lg leading-relaxed font-medium italic">
                                            "{p.content}"
                                        </p>
                                    </div>
                                </div>
                                <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all mt-8">
                                    Download Guidance <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AISmartPlan;

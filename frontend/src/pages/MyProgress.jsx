import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MemberSidebar from '../components/MemberSidebar';
import { LineChart, ArrowUpRight, ArrowDownRight, Activity, TrendingUp } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';
import { useNavigate } from 'react-router-dom';

const MyProgress = () => {
    const [logs, setLogs] = useState([]);
    const [bodyStats, setBodyStats] = useState({ chest: 0, waist: 0, biceps: 0, thighs: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const profileRes = await axios.get('http://localhost:8080/api/member/profile', {
                    headers: { Authorization: auth }
                });

                if (profileRes.data.membershipStatus !== 'ACTIVE') {
                    navigate('/member/membership');
                    return;
                }

                const res = await axios.get('http://localhost:8080/api/member/progress', {
                    headers: { Authorization: auth }
                });
                setLogs(res.data);

                // Fetch body measurements for Radar Chart
                setBodyStats({
                    chest: profileRes.data.chest || 0,
                    waist: profileRes.data.waist || 0,
                    biceps: profileRes.data.biceps || 0,
                    thighs: profileRes.data.thighs || 0
                });
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [navigate]);

    const getWeeklyLogs = (logs) => {
        const weeks = new Map();
        [...logs].reverse().forEach(log => {
            const date = new Date(log.logDate);
            const day = date.getDay() || 7;
            const mondayMonth = date.getMonth();
            const mondayDate = date.getDate() - (day - 1);
            const monday = new Date(date.getFullYear(), mondayMonth, mondayDate);
            const weekKey = monday.toISOString().split('T')[0];
            weeks.set(weekKey, log);
        });
        return Array.from(weeks.values());
    };

    const weeklyLogs = getWeeklyLogs(logs);


    // Simple Line Chart Component using SVG
    const RadarChart = ({ stats }) => {
        const labels = ['Chest', 'Waist', 'Biceps', 'Thighs'];
        const values = [stats.chest, stats.waist, stats.biceps, stats.thighs];
        const maxVal = Math.max(...values, 40); // Base max Scale

        const size = 300;
        const center = size / 2;
        const radius = size * 0.4;

        const getPoint = (val, i, total) => {
            const factor = (val / maxVal) * radius;
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
            return {
                x: center + factor * Math.cos(angle),
                y: center + factor * Math.sin(angle)
            };
        };

        const polygonPoints = values.map((v, i) => {
            const p = getPoint(v, i, values.length);
            return `${p.x},${p.y}`;
        }).join(' ');

        return (
            <div className="flex flex-col items-center">
                <svg width={size} height={size} className="overflow-visible">
                    {/* Background Grids */}
                    {[0.2, 0.4, 0.6, 0.8, 1].map((f, idx) => (
                        <circle key={idx} cx={center} cy={center} r={radius * f} fill="none" stroke="#e2e8f0" strokeDasharray="4" />
                    ))}

                    {/* Axis Lines */}
                    {labels.map((_, i) => {
                        const p = getPoint(maxVal, i, labels.length);
                        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
                    })}

                    {/* Data Polygon */}
                    <motion.polygon
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        points={polygonPoints}
                        fill="rgba(59, 130, 246, 0.3)"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />

                    {/* Labels */}
                    {labels.map((label, i) => {
                        const p = getPoint(maxVal * 1.2, i, labels.length);
                        return (
                            <text key={i} x={p.x} y={p.y} textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase tracking-widest">
                                {label}
                            </text>
                        );
                    })}
                </svg>
                <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                    {labels.map((l, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase">{l}</span>
                            <span className="text-lg font-black text-slate-900">{values[i]}"</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const SimpleChart = ({ logs, valueKey, color, id }) => {
        if (!logs || logs.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400 font-medium bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 px-6 text-center">Update your profile to generate this graph!</div>;

        const data = logs.map(l => l[valueKey]);
        const max = Math.max(...data) * 1.1;
        const min = Math.min(...data) * 0.9;
        const range = max - min || 1;
        const width = 800;
        const height = 200;

        let points = "";
        if (logs.length > 1) {
            points = data.map((val, i) => {
                const x = (i / (data.length - 1)) * width;
                const y = height - ((val - min) / range) * height;
                return `${x},${y}`;
            }).join(' ');
        }

        return (
            <div className="relative w-full bg-slate-50/50 rounded-3xl p-8 border border-slate-100 overflow-visible">
                <div className="h-64 w-full">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                        {logs.length > 1 && (
                            <>
                                <defs>
                                    <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={`M 0,${height} L ${points} L ${width},${height} Z`}
                                    fill={`url(#gradient-${id})`}
                                />
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                    d={`M ${points}`}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </>
                        )}
                        {/* Data Points and Labels */}
                        {logs.map((log, i) => {
                            const x = logs.length === 1 ? width / 2 : (i / (logs.length - 1)) * width;
                            const y = height - ((log[valueKey] - min) / range) * height;
                            return (
                                <g key={i}>
                                    <circle cx={x} cy={y} r={logs.length === 1 ? "8" : "4"} fill="white" stroke={color} strokeWidth={logs.length === 1 ? "4" : "2"} />
                                    <text
                                        x={x}
                                        y={height + 35}
                                        textAnchor="middle"
                                        className="text-[18px] font-black fill-slate-700 uppercase"
                                        transform={logs.length === 1 ? undefined : `rotate(35, ${x}, ${height + 35})`}
                                    >
                                        {new Date(log.logDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </text>
                                    {logs.length === 1 && (
                                        <text x={x} y={y - 20} textAnchor="middle" className="text-xl font-black fill-slate-900">
                                            {log[valueKey]} {id === 'weight' ? 'kg' : ''}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <MemberSidebar activePage="progress" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">

                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <MemberHeader title="My Progress" subtitle="Accelerate your progress today" lightTheme={true} />
                    </div>
                </div>
                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">


                    <div className="grid lg:grid-cols-2 gap-10">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Weight History</h3>
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase">
                                        <TrendingUp size={14} /> +2.4 kg this month
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <SimpleChart logs={weeklyLogs} valueKey="weight" color="#3b82f6" id="weight" />
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">BMI Index</h3>
                                    <div className="flex items-center gap-2 text-blue-500 font-bold text-sm uppercase">
                                        <ArrowUpRight size={14} /> Stable Progress
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <LineChart size={24} />
                                </div>
                            </div>
                            <SimpleChart logs={weeklyLogs} valueKey="bmi" color="#10b981" id="bmi" />
                        </div>

                        {/* Radar Chart Section */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl lg:col-span-2">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Body Transformation Radar</h3>
                                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Structural Measurements Insight</p>
                                </div>
                                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl shadow-lg shadow-purple-500/10">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-12">
                                <div className="flex-1 w-full max-w-sm">
                                    <RadarChart stats={bodyStats} />
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white">
                                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <TrendingUp size={20} className="text-blue-400" /> Improvement Logic
                                        </h4>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                            This radar chart visualizes the balance of your physique. A larger, more symmetric shape indicates a well-proportioned aesthetic development.
                                        </p>
                                        <button
                                            onClick={() => navigate('/member/profile')}
                                            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            Update Measurements <ArrowUpRight size={18} />
                                        </button>
                                    </div>
                                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 italic text-blue-700 text-xs font-bold leading-relaxed">
                                        "Focus on symmetry. If one side of the chart is lagging, adjust your workout volume for that specific muscle group."
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                        <h3 className="text-2xl font-bold mb-8">Recent Logs</h3>
                        <div className="space-y-4">
                            {logs.slice().reverse().map((log, i) => (
                                <div key={i} className="grid grid-cols-4 items-center p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="font-bold text-slate-400">{new Date(log.logDate).toLocaleDateString()}</span>
                                    <span className="font-bold text-lg">{log.weight} kg</span>
                                    <span className="font-bold text-lg text-blue-400">{log.bmi.toFixed(1)} BMI</span>
                                    <span className="text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                                        <ArrowUpRight size={16} /> Record
                                    </span>
                                </div>
                            ))}
                            {logs.length === 0 && <p className="text-center text-slate-500 py-10 italic">No logs found yet. Start by updating your profile!</p>}
                        </div>
                    </div>
                </div>

                <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center relative z-20">
                    <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 border-b border-slate-800 pb-8">
                        <div className="flex flex-col gap-4 max-w-[200px]">
                            <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                                <div className="text-white bg-blue-600 p-1 rounded min-w-[32px] min-h-[32px] flex items-center justify-center font-bold">MH</div> MUSCLEHUB
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-500">Premium Fitness Management</p>
                        </div>
                        <div className="flex flex-1 justify-around gap-4 text-[11px]">
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">About Us</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>Our gym's vision, story & core mission.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Services</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>AI plans, top-tier trainers & facilities.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Contact</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>24/7 dedicated support & inquiry line.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Privacy Policy</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>Data security, user safety & terms.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-slate-400">FB</button>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors text-slate-400">TW</button>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors text-slate-400">IG</button>
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

export default MyProgress;

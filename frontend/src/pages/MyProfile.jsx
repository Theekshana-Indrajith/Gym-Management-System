import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MemberSidebar from '../components/MemberSidebar';
import { User, Mail, Calendar, Ruler, Weight, FileText, Save, CheckCircle } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';
import MemberPageBanner from '../components/MemberPageBanner';

const InputField = ({ label, icon: Icon, name, type, placeholder, value, onChange }) => (
    <div className="space-y-2">
        <label className="block text-slate-500 text-xs font-black uppercase tracking-widest">{label}</label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon size={18} />
            </div>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-4 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 font-bold"
            />
        </div>
    </div>
);

const MyProfile = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        age: '',
        height: '',
        weight: '',
        healthDetails: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const res = await axios.get('http://localhost:8080/api/member/profile', {
                    headers: { Authorization: auth }
                });
                setFormData({
                    username: res.data.username || '',
                    email: res.data.email || '',
                    age: res.data.age || '',
                    height: res.data.height || '',
                    weight: res.data.weight || '',
                    healthDetails: res.data.healthDetails || ''
                });
            } catch (err) {
                console.error("Failed to fetch profile", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('auth');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.put('http://localhost:8080/api/member/profile', formData, {
                headers: { Authorization: auth }
            });
            setMessage('Profile updated successfully! BMI recalculated.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100">
            <MemberSidebar activePage="profile" />
            <main className="ml-64 flex-1 p-6">
                <MemberPageBanner title="My Profile" subtitle="Manage your personal details and health information" icon={User} />

                <div className="max-w-4xl">
                    {message && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-6 rounded-[2rem] mb-8 flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <CheckCircle size={20} />
                            </div>
                            <span className="font-bold">{message}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-12">
                        <div className="grid grid-cols-2 gap-8">
                            <InputField label="Username" icon={User} name="username" type="text" value={formData.username} onChange={handleChange} />
                            <InputField label="Email Address" icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-3 gap-8 p-8 bg-blue-50 rounded-[2rem] border border-blue-100/50">
                            <InputField label="Age" icon={Calendar} name="age" type="number" placeholder="e.g. 25" value={formData.age} onChange={handleChange} />
                            <InputField label="Height (cm)" icon={Ruler} name="height" type="number" placeholder="e.g. 175" value={formData.height} onChange={handleChange} />
                            <InputField label="Weight (kg)" icon={Weight} name="weight" type="number" placeholder="e.g. 70" value={formData.weight} onChange={handleChange} />
                        </div>

                        {/* BMI Display Section */}
                        {formData.height && formData.weight && (
                            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2rem] border border-purple-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-black text-slate-900">Your BMI</h3>
                                    <div className="text-4xl font-black text-purple-600">
                                        {(formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${(formData.weight / Math.pow(formData.height / 100, 2)) < 18.5 ? 'bg-blue-500' :
                                            (formData.weight / Math.pow(formData.height / 100, 2)) < 25 ? 'bg-green-500' :
                                                (formData.weight / Math.pow(formData.height / 100, 2)) < 30 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                            }`}></div>
                                        <span className="text-sm font-bold text-slate-600">
                                            {(formData.weight / Math.pow(formData.height / 100, 2)) < 18.5 ? 'Underweight' :
                                                (formData.weight / Math.pow(formData.height / 100, 2)) < 25 ? 'Normal Weight' :
                                                    (formData.weight / Math.pow(formData.height / 100, 2)) < 30 ? 'Overweight' :
                                                        'Obese'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${(formData.weight / Math.pow(formData.height / 100, 2)) < 18.5 ? 'bg-blue-500 w-[25%]' :
                                                (formData.weight / Math.pow(formData.height / 100, 2)) < 25 ? 'bg-green-500 w-[50%]' :
                                                    (formData.weight / Math.pow(formData.height / 100, 2)) < 30 ? 'bg-yellow-500 w-[75%]' :
                                                        'bg-red-500 w-[100%]'
                                                }`}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic mt-2">
                                        BMI is calculated from your height and weight. Update your measurements for accurate tracking.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block text-slate-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <FileText size={16} /> Health Details & Conditions
                            </label>
                            <textarea
                                name="healthDetails"
                                value={formData.healthDetails}
                                onChange={handleChange}
                                placeholder="Describe your health status, BMI goals, or any medical conditions..."
                                className="w-full p-6 rounded-[2rem] border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all h-40 bg-white font-medium text-slate-700 leading-relaxed"
                            ></textarea>
                        </div>

                        <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-95">
                            <Save size={24} /> Update All Information
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default MyProfile;

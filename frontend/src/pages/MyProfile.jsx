import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MemberSidebar from '../components/MemberSidebar';
import { User, Mail, Calendar, Ruler, Weight, FileText, Save, CheckCircle, Phone, Users, Activity, Box, TrendingUp } from 'lucide-react';
import axios from 'axios';
import MemberHeader from '../components/MemberHeader';

const InputField = ({ label, icon: Icon, name, type, placeholder, value, onChange }) => (
    <div className="space-y-2">
        <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</label>
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
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        height: '',
        weight: '',
        gender: '',
        phoneNumber: '',
        fitnessGoal: '',
        allergies: '',
        chest: '',
        waist: '',
        biceps: '',
        thighs: '',
        healthDetails: '',
        dietaryPreference: 'NON_VEG',
        excludedMeatTypes: ''
    });
    const [activeTab, setActiveTab] = useState('basic');
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
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    email: res.data.email || '',
                    age: res.data.age || '',
                    height: res.data.height || '',
                    weight: res.data.weight || '',
                    gender: res.data.gender || '',
                    phoneNumber: res.data.phoneNumber || '',
                    fitnessGoal: res.data.fitnessGoal || '',
                    allergies: res.data.allergies || '',
                    chest: res.data.chest || '',
                    waist: res.data.waist || '',
                    biceps: res.data.biceps || '',
                    thighs: res.data.thighs || '',
                    healthDetails: res.data.healthDetails || '',
                    dietaryPreference: res.data.dietaryPreference || 'NON_VEG',
                    excludedMeatTypes: res.data.excludedMeatTypes || ''
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

        // Validation
        const nameRegex = /^[a-zA-Z\s.-]+$/;
        if (formData.firstName && !nameRegex.test(formData.firstName)) {
            alert("First name cannot contain numbers.");
            return;
        }
        if (formData.lastName && !nameRegex.test(formData.lastName)) {
            alert("Last name cannot contain numbers.");
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
            alert("Please provide a valid 10-digit phone number (e.g. 0771234567).");
            return;
        }

        if (formData.age && parseInt(formData.age) <= 0) {
            alert("Age must be greater than 0.");
            return;
        }
        if (formData.weight && parseFloat(formData.weight) <= 0) {
            alert("Weight must be greater than 0.");
            return;
        }
        if (formData.height && parseFloat(formData.height) <= 0) {
            alert("Height must be greater than 0.");
            return;
        }

        const measurementFields = ['chest', 'waist', 'biceps', 'thighs'];
        for (const field of measurementFields) {
            if (formData[field] && parseFloat(formData[field]) <= 0) {
                alert(`${field.charAt(0).toUpperCase() + field.slice(1)} measurement must be greater than 0.`);
                return;
            }
        }

        if (formData.allergies && /\d/.test(formData.allergies)) {
            alert("Allergies description cannot contain numbers.");
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.put('http://localhost:8080/api/member/profile', formData, {
                headers: { Authorization: auth }
            });
            setMessage('Profile updated successfully! BMI recalculated.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <MemberSidebar activePage="profile" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">

                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <MemberHeader title="My Profile" subtitle="Accelerate your progress today" lightTheme={true} />
                    </div>
                </div>
                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">


                    <div className="max-w-4xl">
                        {message && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-6 rounded-[2rem] mb-8 flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <CheckCircle size={20} />
                                </div>
                                <span className="font-bold">{message}</span>
                            </motion.div>
                        )}

                        <div className="flex gap-4 mb-8 bg-white/50 p-2 rounded-[2rem] border border-white max-w-md">
                            <button
                                onClick={() => setActiveTab('basic')}
                                className={`flex-1 py-4 rounded-[1.5rem] font-bold transition-all ${activeTab === 'basic' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                            >
                                Basic Info
                            </button>
                            <button
                                onClick={() => setActiveTab('body')}
                                className={`flex-1 py-4 rounded-[1.5rem] font-bold transition-all ${activeTab === 'body' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                            >
                                Body Measurements
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-12">
                            {activeTab === 'basic' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-8">
                                        <InputField label="First Name" icon={User} name="firstName" type="text" value={formData.firstName} onChange={handleChange} />
                                        <InputField label="Last Name" icon={User} name="lastName" type="text" value={formData.lastName} onChange={handleChange} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <InputField label="Username (Display Name)" icon={User} name="username" type="text" value={formData.username} onChange={handleChange} />
                                        <InputField label="Email Address" icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Gender</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Users size={18} />
                                                </div>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-4 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 font-bold appearance-none"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <InputField label="Phone Number" icon={Phone} name="phoneNumber" type="text" placeholder="e.g. 0771234567" value={formData.phoneNumber} onChange={handleChange} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Save size={16} /> Fitness Goal
                                            </label>
                                            <select
                                                name="fitnessGoal"
                                                value={formData.fitnessGoal}
                                                onChange={handleChange}
                                                className="w-full pl-6 pr-4 py-4 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 font-bold appearance-none"
                                            >
                                                <option value="">Select Goal</option>
                                                <option value="Weight Loss">Weight Loss</option>
                                                <option value="Muscle Building">Muscle Building</option>
                                                <option value="Endurance Training">Endurance Training</option>
                                                <option value="Flexibility">Flexibility / Yoga</option>
                                                <option value="Body Transformation">General Body Transformation</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={16} /> Allergies (If Any)
                                            </label>
                                            <input
                                                name="allergies"
                                                type="text"
                                                value={formData.allergies}
                                                onChange={handleChange}
                                                placeholder="e.g. Peanuts, Gluten, Lactose..."
                                                className="w-full pl-6 pr-4 py-4 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 p-8 bg-blue-50 rounded-[2rem] border border-blue-100/50">
                                        <InputField label="Age" icon={Calendar} name="age" type="number" placeholder="e.g. 25" value={formData.age} onChange={handleChange} />
                                        <InputField label="Height (cm)" icon={Ruler} name="height" type="number" placeholder="e.g. 175" value={formData.height} onChange={handleChange} />
                                        <InputField label="Weight (kg)" icon={Weight} name="weight" type="number" placeholder="e.g. 70" value={formData.weight} onChange={handleChange} />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-8">
                                    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] border border-blue-100">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Activity size={20} className="text-blue-600" /> Current Body Measurements (Inches)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-8">
                                            <InputField label="Chest" icon={Box} name="chest" type="number" placeholder="inches" value={formData.chest} onChange={handleChange} />
                                            <InputField label="Waist" icon={Activity} name="waist" type="number" placeholder="inches" value={formData.waist} onChange={handleChange} />
                                            <InputField label="Biceps" icon={TrendingUp} name="biceps" type="number" placeholder="inches" value={formData.biceps} onChange={handleChange} />
                                            <InputField label="Thighs" icon={Weight} name="thighs" type="number" placeholder="inches" value={formData.thighs} onChange={handleChange} />
                                        </div>
                                        <p className="mt-6 text-sm text-slate-500 font-medium bg-white/50 p-4 rounded-2xl italic">
                                            These measurements will be used to generate your Body Transformation Radar Chart in the progress section.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* BMI Display Section */}
                            {formData.height && formData.weight && (
                                <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2rem] border border-purple-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-slate-900">Your BMI</h3>
                                        <div className="text-4xl font-bold text-purple-600">
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

                            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Activity size={20} className="text-emerald-600" /> Dietary Strategy & Preferences
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Base Diet Preference</label>
                                        <select
                                            name="dietaryPreference"
                                            value={formData.dietaryPreference}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white text-slate-900 font-bold appearance-none"
                                        >
                                            <option value="NON_VEG">Non-Vegetarian</option>
                                            <option value="VEGETARIAN">Vegetarian (Veg)</option>
                                            <option value="VEGAN">Vegan (Plant Based)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest">Exclude Meat Types (Comma separated)</label>
                                        <input
                                            name="excludedMeatTypes"
                                            type="text"
                                            value={formData.excludedMeatTypes}
                                            onChange={handleChange}
                                            placeholder="e.g. BEEF, PORK, MUTTON"
                                            className="w-full px-6 py-4 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white text-slate-900 font-bold"
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium px-2 italic">Separating by comma allows your trainer to see specifically what to avoid.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
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

                            <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-bold text-lg transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-95">
                                <Save size={24} /> Update All Information
                            </button>
                        </form>
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

export default MyProfile;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import { Activity, Dumbbell, Utensils, Send, User, Target, Zap, Coffee, Sun, Moon, Candy, Pill } from 'lucide-react';
import axios from 'axios';
import TrainerPageBanner from '../components/TrainerPageBanner';

const AssignWorkouts = () => {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [activeTab, setActiveTab] = useState('workout'); // 'workout' or 'meal'
    const [loading, setLoading] = useState(true);

    // Workout Plan State
    const [workoutPlanName, setWorkoutPlanName] = useState('');
    const [exercises, setExercises] = useState('');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [goal, setGoal] = useState('Muscle Gain');

    // Meal Plan State
    const [mealPlanName, setMealPlanName] = useState('');
    const [breakfast, setBreakfast] = useState('');
    const [lunch, setLunch] = useState('');
    const [dinner, setDinner] = useState('');
    const [snacks, setSnacks] = useState('');
    const [dailyCalories, setDailyCalories] = useState('');
    const [dietType, setDietType] = useState('High Protein');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                const res = await axios.get('http://localhost:8080/api/trainer/my-members', {
                    headers: { Authorization: auth }
                });
                setMembers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const handleWorkoutSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMember) return alert("Select a member");
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/trainer/workout-plan', {
                memberId: selectedMember,
                planName: workoutPlanName,
                exercises: exercises,
                difficulty: difficulty,
                goal: goal
            }, { headers: { Authorization: auth } });
            alert("Workout Plan assigned successfully!");
            setWorkoutPlanName('');
            setExercises('');
        } catch (err) {
            alert("Failed to assign workout plan");
        }
    };

    const handleMealSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMember) return alert("Select a member");
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/trainer/meal-plan', {
                memberId: selectedMember,
                planName: mealPlanName,
                breakfast: breakfast,
                lunch: lunch,
                dinner: dinner,
                snacks: snacks,
                dailyCalories: dailyCalories,
                dietType: dietType,
                dietType: dietType
            }, { headers: { Authorization: auth } });
            alert("Meal Plan assigned successfully!");
            setMealPlanName('');
            setBreakfast('');
            setLunch('');
            setDinner('');
            setSnacks('');
            setDailyCalories('');
        } catch (err) {
            alert("Failed to assign meal plan");
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-100 to-slate-100">
            <TrainerSidebar activePage="assign" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <TrainerPageBanner title="Assign Plans" subtitle="Create personalized workout and nutrition guides for your members." icon={Activity} />

                <div className="max-w-5xl">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-8">
                        <div>
                            <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Select Member</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                                >
                                    <option value="" className="bg-white">Choose an athlete...</option>
                                    {members.map(m => <option key={m.id} value={m.id} className="bg-white">{m.username}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                            <button
                                onClick={() => setActiveTab('workout')}
                                className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'workout' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Dumbbell size={18} /> Workout Plan
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('meal')}
                                className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'meal' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Utensils size={18} /> Meal Plan
                                </div>
                            </button>
                        </div>

                        {activeTab === 'workout' ? (
                            <form onSubmit={handleWorkoutSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Plan Name</label>
                                        <input
                                            type="text"
                                            value={workoutPlanName}
                                            onChange={(e) => setWorkoutPlanName(e.target.value)}
                                            placeholder="e.g., Summer Shredding"
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Difficulty</label>
                                            <select
                                                value={difficulty}
                                                onChange={(e) => setDifficulty(e.target.value)}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                                            >
                                                <option value="Beginner" className="bg-white">Beginner</option>
                                                <option value="Intermediate" className="bg-white">Intermediate</option>
                                                <option value="Advanced" className="bg-white">Advanced</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Goal</label>
                                            <select
                                                value={goal}
                                                onChange={(e) => setGoal(e.target.value)}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                                            >
                                                <option value="Muscle Gain" className="bg-white">Muscle Gain</option>
                                                <option value="Weight Loss" className="bg-white">Weight Loss</option>
                                                <option value="Endurance" className="bg-white">Endurance</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Exercises & Routine</label>
                                    <textarea
                                        value={exercises}
                                        onChange={(e) => setExercises(e.target.value)}
                                        placeholder="1. Bench Press 3x10&#10;2. Squats 4x12..."
                                        className="w-full p-6 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold h-48 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    ></textarea>
                                </div>
                                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all">
                                    <Zap size={20} /> Assign Workout Plan
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleMealSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Plan Name</label>
                                        <input
                                            type="text"
                                            value={mealPlanName}
                                            onChange={(e) => setMealPlanName(e.target.value)}
                                            placeholder="e.g., Keto Focus"
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Diet Type</label>
                                        <select
                                            value={dietType}
                                            onChange={(e) => setDietType(e.target.value)}
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            <option value="High Protein" className="bg-white">High Protein</option>
                                            <option value="Keto" className="bg-white">Keto</option>
                                            <option value="Vegan" className="bg-white">Vegan</option>
                                            <option value="Balanced" className="bg-white">Balanced</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Daily Calories</label>
                                        <input
                                            type="number"
                                            value={dailyCalories}
                                            onChange={(e) => setDailyCalories(e.target.value)}
                                            placeholder="e.g., 2500"
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                                <Coffee size={14} className="text-emerald-500" /> Breakfast
                                            </label>
                                            <textarea
                                                value={breakfast}
                                                onChange={(e) => setBreakfast(e.target.value)}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold h-24 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            ></textarea>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                                <Sun size={14} className="text-yellow-500" /> Lunch
                                            </label>
                                            <textarea
                                                value={lunch}
                                                onChange={(e) => setLunch(e.target.value)}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold h-24 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                                <Moon size={14} className="text-blue-500" /> Dinner
                                            </label>
                                            <textarea
                                                value={dinner}
                                                onChange={(e) => setDinner(e.target.value)}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold h-24 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            ></textarea>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                                <Candy size={14} className="text-pink-500" /> Snacks
                                            </label>
                                            <textarea
                                                value={snacks}
                                                onChange={(e) => setSnacks(e.target.value)}
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold h-24 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>


                                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all">
                                    <Activity size={20} /> Deploy Nutrition Plan
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssignWorkouts;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrainerSidebar from '../components/TrainerSidebar';
import { Settings, AlertTriangle, CheckCircle, RefreshCw, Wrench, Activity } from 'lucide-react';
import axios from 'axios';
import TrainerPageBanner from '../components/TrainerPageBanner';

const EquipmentStatus = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEquipment = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/trainer/equipment', {
                headers: { Authorization: auth }
            });
            setEquipment(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.put(`http://localhost:8080/api/trainer/equipment/${id}`, { status }, {
                headers: { Authorization: auth }
            });
            fetchEquipment();
        } catch (err) {
            alert("Update failed");
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-100 to-slate-100">
            <TrainerSidebar activePage="equipment" />
            <main className="ml-64 flex-1 p-6 flex flex-col">
                <TrainerPageBanner title="Equipment Status" subtitle="Report broken equipment to ensure member safety." icon={Activity} />

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {equipment.map((item) => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${item.status === 'WORKING' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                    <Settings size={24} />
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${item.status === 'WORKING' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {item.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">{item.name}</h3>
                            <p className="text-slate-400 text-sm mb-8">Last checked: {item.lastMaintenanceDate || 'N/A'}</p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateStatus(item.id, 'WORKING')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${item.status === 'WORKING' ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'}`}
                                >
                                    <CheckCircle size={18} /> Working
                                </button>
                                <button
                                    onClick={() => updateStatus(item.id, 'BROKEN')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${item.status === 'BROKEN' ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20'}`}
                                >
                                    <AlertTriangle size={18} /> Reported
                                </button>
                            </div>
                        </div>
                    ))}
                    {equipment.length === 0 && (
                        <p className="col-span-full text-center py-20 text-slate-400 font-bold italic">No equipment listed in the system.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EquipmentStatus;

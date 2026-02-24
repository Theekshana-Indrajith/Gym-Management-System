import React from 'react';
import { motion } from 'framer-motion';
import MemberHeader from './MemberHeader';

const GYM_HERO = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop";

const MemberPageBanner = ({ title, subtitle, icon: Icon }) => {
    return (
        <div className="relative h-64 overflow-hidden rounded-[2.5rem] mb-8 shrink-0 shadow-xl">
            <img src={GYM_HERO} alt="Gym" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />

            <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="-mt-2 -mr-2">
                    <MemberHeader title="" />
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {Icon && (
                        <div className="flex items-center gap-2 mb-3">
                            <Icon size={18} className="text-blue-400" />
                            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">MuscleHub</span>
                        </div>
                    )}
                    <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">{title}</h1>
                    {subtitle && <p className="text-slate-300 text-sm font-medium">{subtitle}</p>}
                </motion.div>
            </div>
        </div>
    );
};

export default MemberPageBanner;

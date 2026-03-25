import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <span className="text-2xl font-bold text-white">MuscleHub</span>
                    <p className="text-sm mt-2 text-slate-500">&copy; 2026 MuscleHub. All rights reserved.</p>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

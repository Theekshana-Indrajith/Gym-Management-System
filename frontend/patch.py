import sys
import os

def process_file(file_path, header_title, header_subtitle):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add MemberHeader import if not present
    if 'import MemberHeader' not in content:
        content = content.replace("import axios from 'axios';", "import axios from 'axios';\nimport MemberHeader from '../components/MemberHeader';")

    # 2. Add isMember and replace main wrapper
    search_str = '''    return (
        <div className="flex min-h-screen bg-[#0f172a]">
            {user && renderSidebar()}

            <main className="ml-64 flex-1 p-10">'''

    replace_str = f'''    const isMember = user?.role === 'MEMBER';

    return (
        <div className={{`flex min-h-screen ${{isMember ? 'bg-slate-50 font-sans' : 'bg-[#0f172a]' }}`}}>
            {{user && renderSidebar()}}

            <main className={{`ml-64 flex-1 flex flex-col min-h-screen`}}>
                {{isMember ? (
                    <div className="relative bg-slate-900 px-8 pt-8 pb-14 overflow-hidden shadow-sm">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                        <div className="relative z-10 max-w-[1400px] mx-auto w-full">
                            <MemberHeader title="{header_title}" subtitle="{header_subtitle}" lightTheme={{true}} />
                        </div>
                    </div>
                ) : (
                    <div className="px-10 pt-10">'''

    content = content.replace(search_str, replace_str)

    # Close the div of else (for header)
    content = content.replace('                    </header>', '                    </header>\n                    </div>\n                )}')

    # 3. Add flex-1 wrapper around the content
    content = content.replace('                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">',
f'''                <div className={{`flex-1 ${{isMember ? 'px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20' : 'p-10 pt-6'}}`}}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">''')

    # Find where to close flex-1 wrapper
    content = content.replace('                {/* Trainer Only: AI Generation Quick Select */}', '                </div>\n\n                {/* Trainer Only: AI Generation Quick Select */}')

    # 4. Modify the card look
    content = content.replace('className="bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden"', 'className={isMember ? "bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-all group relative overflow-hidden" : "bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden"}')

    content = content.replace('className="bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden"', 'className={isMember ? "bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-all group relative overflow-hidden" : "bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden"}')

    content = content.replace('h3 className="text-xl font-bold text-white mb-1"', 'h3 className={`text-xl font-bold mb-1 ${isMember ? \'text-slate-900\' : \'text-white\'}`}')

    content = content.replace('className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-white/5 scrollbar-hide overflow-y-auto max-h-48"', 'className={`${isMember ? \'bg-slate-50 border-slate-100 text-slate-600\' : \'bg-slate-900/50 border-white/5 text-slate-400\'} rounded-2xl p-6 mb-6 border scrollbar-hide overflow-y-auto max-h-48`}')

    content = content.replace('className="text-slate-400 text-sm leading-relaxed whitespace-pre-line"', 'className={`${isMember ? \'text-slate-600\' : \'text-slate-400\'} text-sm leading-relaxed whitespace-pre-line`}')

    content = content.replace('font-black text-lg text-white', 'font-black text-lg ${isMember ? \'text-slate-800\' : \'text-white\'}')

    # 5. Add footer before </main>
    footer_code = '''                {isMember && (
                    <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center relative z-20">
                        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 border-b border-slate-800 pb-8">
                            <div className="flex flex-col gap-4 max-w-[200px]">
                                <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                                    <div className="text-white bg-blue-600 p-1 rounded min-w-[32px] min-h-[32px] flex items-center justify-center font-black">MH</div> MUSCLEHUB
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-500">Premium Fitness Management</p>
                            </div>
                            
                            <div className="flex flex-1 justify-around gap-4 text-[11px]">
                                <div>
                                    <h4 className="text-white font-bold mb-4 text-[13px] font-display">About Us</h4>
                                    <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                        <li>Our gym's vision, story & core mission.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-4 text-[13px] font-display">Services</h4>
                                    <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                        <li>AI plans, top-tier trainers & facilities.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-4 text-[13px] font-display">Contact</h4>
                                    <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                        <li>24/7 dedicated support & inquiry line.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-4 text-[13px] font-display">Privacy Policy</h4>
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
                )}
            </main>'''
    content = content.replace('            </main>', footer_code)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/pages/WorkoutPlanManagement.jsx', 'Workout Plans', 'View and track your training routines')
process_file('src/pages/MealPlanManagement.jsx', 'Meal Plans', 'View and track your dietary requirements')

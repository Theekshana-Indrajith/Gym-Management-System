import re
import os

files_to_update = [
    'src/pages/MyProfile.jsx',
    'src/pages/AISmartPlan.jsx',
    'src/pages/TrainerSessions.jsx',
    'src/pages/SupplementStore.jsx',
    'src/pages/MyProgress.jsx',
    'src/pages/MembershipSelection.jsx'
]

footer_code = '''
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
'''

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change to light font-sans theme wrapper
    content = content.replace('<div className="flex min-h-screen bg-slate-50">', '<div className="flex min-h-screen bg-slate-50 font-sans">')
    content = content.replace('<main className="ml-64 flex-1 p-10">', '<main className="ml-64 flex-1 flex flex-col min-h-screen">')
    
    # Extract existing MemberHeader
    header_match = re.search(r'<MemberHeader\s+title=(["\'].*?["\']|\{.*?\})\s*/>', content)
    if header_match:
        original_header = header_match.group(0)
        title_attr = header_match.group(1)
        if title_attr.startswith('"') or title_attr.startswith("'"):
            title_text = title_attr[1:-1]
        else:
            title_text = "MuscleHub Portal"

        new_header_block = f'''
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 overflow-hidden shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                    <div className="relative z-10 max-w-[1400px] mx-auto w-full">
                        <MemberHeader title={title_attr} subtitle="Accelerate your progress today" lightTheme={{true}} />
                    </div>
                </div>
                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20">
'''
        content = content.replace(original_header, new_header_block)

    # Change some dark backgrounds inside components to light backgrounds explicitly
    # The user asked for "light colors" matching the theme. Many forms use white backgrounds.
    # The SupplementStore uses bg-slate-900 which we can replace to white if present.
    content = content.replace('bg-slate-900 text-white rounded-[2.5rem]', 'bg-white text-slate-900 border border-slate-100 shadow-xl rounded-[2.5rem]')
    content = content.replace('bg-slate-800 text-white', 'bg-white text-slate-900 border border-slate-100 shadow-sm')

    # Remove font-black/font-display since they want the clean font-sans style from the photos
    content = content.replace('font-black', 'font-bold')
    content = content.replace('font-display', 'font-sans')

    # Insert footer before the closing </main>
    if footer_code not in content:
        content = content.replace('</main>', '</div>\n' + footer_code + '\n</main>')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Patching complete.")

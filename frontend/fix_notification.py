import os

files = [
    'src/pages/MemberDashboard.jsx',
    'src/pages/MyProfile.jsx',
    'src/pages/AISmartPlan.jsx',
    'src/pages/TrainerSessions.jsx',
    'src/pages/SupplementStore.jsx',
    'src/pages/MyProgress.jsx'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove overflow-hidden from the hero container
        content = content.replace(
            'className="relative bg-slate-900 px-8 pt-8 pb-14 overflow-hidden shadow-sm"',
            'className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm"'
        )
        content = content.replace(
            'className="relative bg-slate-900 px-8 pt-8 pb-14 overflow-hidden"',
            'className="relative bg-slate-900 px-8 pt-8 pb-14"'
        )
        
        # Change inner z-index from 10 to 50 so it overlays the content block correctly
        content = content.replace(
            'className="relative z-10 max-w-[1400px] mx-auto w-full"',
            'className="relative z-50 max-w-[1400px] mx-auto w-full"'
        )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file_path}")


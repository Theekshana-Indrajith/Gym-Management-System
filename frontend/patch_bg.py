import os

files_to_update = [
    'src/pages/MemberDashboard.jsx',
    'src/pages/WorkoutPlanManagement.jsx',
    'src/pages/MealPlanManagement.jsx',
    'src/pages/MyProfile.jsx',
    'src/pages/AISmartPlan.jsx',
    'src/pages/TrainerSessions.jsx',
    'src/pages/SupplementStore.jsx',
    'src/pages/MyProgress.jsx',
    'src/pages/MembershipSelection.jsx'
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace exactly the main wrapper background
    # 1. Dashboard, Profile, Store, etc.
    content = content.replace('className="flex min-h-screen bg-slate-50', 'className="flex min-h-screen bg-slate-100')
    content = content.replace('className="min-h-screen bg-slate-50', 'className="min-h-screen bg-slate-100')
    
    # 2. Workout & Meal plans
    content = content.replace("'bg-slate-50 font-sans'", "'bg-slate-100 font-sans'")

    # Optional: also slightly darken some card background states if they were slate-50 to slate-100
    # But user specifically asked for "background ekt" (for the background). 
    # Cards using bg-slate-50 (like the inner stats boxes) might be fine or they could become bg-slate-200 for depth.
    # We will leave cards as bg-slate-50 for now, or just focus on the main wrapper.

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Main background updated to bg-slate-100 across member pages.")

import os
import re

files_to_update = [
    'src/pages/MyProfile.jsx',
    'src/pages/AISmartPlan.jsx',
    'src/pages/TrainerSessions.jsx',
    'src/pages/SupplementStore.jsx',
    'src/pages/MyProgress.jsx'
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The issue: the file has multiple footers, right before </main>.
    # They look like:
    # </div>
    # <footer ...> ... </footer>
    # </main>
    # What we actually want is to just remove the extra block.
    # Let's find all occurrences of the footer tag.
    
    footer_pattern = re.compile(r'(</div>\s*<footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center relative z-20">.*?</footer>\s*)</main>', re.DOTALL)
    
    # We only want to remove it if it's right before </main> AND there is another footer earlier.
    # Actually, if we just remove the ENTIRE block `</div>\n<footer>...</footer>` right before `</main>`,
    # wait! The FIRST script run added that block. But then we modified the first footer? 
    # No, we only modified bg. 
    # Because there are TWO footers, the LAST one is always right before </main> and always preceded by </div>.
    # Is the FIRST footer preceded by </div>?
    # No, it's also probably preceded by </div> because `patch_members.py` replaced `</main>` with `</div> [footer] </main>` BOTH TIMES.
    # So the structure is:
    # [Rest of file]
    # </div>
    # <footer> original footer </footer>
    # </div>
    # <footer> duplicate footer </footer>
    # </main>
    
    # We can just delete the LAST one.
    
    # Let's find the last occurrence of the pattern
    matches = list(re.finditer(r'</div>\s*<footer className="bg-slate-950.*?</footer>\s*', content, re.DOTALL))
    if len(matches) > 1:
        # Get the very last match
        last_match = matches[-1]
        
        # We need to make sure this last match is sitting right before </main>
        content_after = content[last_match.end():]
        if content_after.strip().startswith('</main>'):
            # Safe to remove the last match
            new_content = content[:last_match.start()] + content_after
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed duplicate footer from {file_path}")


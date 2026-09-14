import sys
with open('src/Sidebar.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Update green button link
for i in range(len(lines)):
    if 'href={sheetUrl}' in lines[i]:
        lines[i] = lines[i].replace('href={sheetUrl}', 'href={`${import.meta.env.BASE_URL}BOQ_Fixed_Original_Format.csv`}')
        break

text = "".join(lines)

import re
# Extract 'ai' block
ai_match = re.search(r'\s*<button[^>]+onClick={\(\) => { setActiveTab\(\'ai\'\).*?</button>', text, re.DOTALL)
ai_block = ai_match.group(0) if ai_match else ''

# Extract 'simulator' block
sim_match = re.search(r'\s*<button[^>]+onClick={\(\) => { setActiveTab\(\'simulator\'\).*?</button>', text, re.DOTALL)
sim_block = sim_match.group(0) if sim_match else ''

if ai_block:
    text = text.replace(ai_block, '')
if sim_block:
    text = text.replace(sim_block, '')

# Find bom block
bom_match = re.search(r'(\s*<button[^>]+onClick={\(\) => { setActiveTab\(\'bom\'\).*?</button>)', text, re.DOTALL)
if bom_match:
    bom_block = bom_match.group(1)
    # Append the extracted blocks after bom_block
    text = text.replace(bom_block, bom_block + ai_block + sim_block)

with open('src/Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Restored and moved successfully')

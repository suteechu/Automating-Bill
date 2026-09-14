import re

with open('src/Sidebar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract 'ai' block
ai_match = re.search(r'\s*<button[^>]+onClick={\(\) => { setActiveTab\(\'ai\'\)[^<]+<span className="shrink-0">🤖</span>[^<]+</button>', text)
ai_block = ai_match.group(0) if ai_match else ''

# Extract 'simulator' block
sim_match = re.search(r'\s*<button[^>]+onClick={\(\) => { setActiveTab\(\'simulator\'\)[^<]+<span className="shrink-0">🧪</span>[^<]+</button>', text)
sim_block = sim_match.group(0) if sim_match else ''

if ai_block: text = text.replace(ai_block, '')
if sim_block: text = text.replace(sim_block, '')

# Find bom block to insert after
bom_match = re.search(r'(\s*<button[^>]+onClick={\(\) => { setActiveTab\(\'bom\'\)[^<]+<span className="shrink-0">⚙️</span>[^<]+</button>)', text)
if bom_match:
    bom_block = bom_match.group(1)
    text = text.replace(bom_block, bom_block + ai_block + sim_block)

with open('src/Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Moved successfully with regex')

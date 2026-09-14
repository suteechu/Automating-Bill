import json

with open('new_cats.json', 'r', encoding='utf-8') as f:
    new_cats_str = f.read()

with open('src/constants.js', 'r', encoding='utf-8') as f:
    constants = f.read()

import re
# Remove quotes from keys
new_cats_str = re.sub(r'"([^"]+)":', r'\1:', new_cats_str)

start_marker = "export const initialCategories = ["
end_marker = "export const variableGroups = ["

start_idx = constants.find(start_marker)
end_idx = constants.find(end_marker)

if start_idx != -1 and end_idx != -1:
    pre = constants[:start_idx]
    post = constants[end_idx:]
    new_content = pre + "export const initialCategories = " + new_cats_str + ";\n\n" + post
    with open('src/constants.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Markers not found")

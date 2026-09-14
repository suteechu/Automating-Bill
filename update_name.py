import re
with open('src/constants.js', 'r', encoding='utf-8') as f:
    text = f.read()

new_text = text.replace('name: "ค่าดำเนินการ"', 'name: "รายการเพิ่มเติม/ค่าดำเนินการ"')

with open('src/constants.js', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Updated successfully')

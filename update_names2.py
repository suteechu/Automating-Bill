import re
with open('src/constants.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('name: "โครงสร้าง โครงหลังคา"', 'name: "งานโครงสร้าง โครงหลังคา"')
text = text.replace('name: "รายการเพิ่มเติม/ค่าดำเนินการ"', 'name: "อุปกรณ์เพิ่มเติม/ค่าดำเนินการ"')
text = text.replace('name: "ค่าดำเนินการ"', 'name: "อุปกรณ์เพิ่มเติม/ค่าดำเนินการ"')
text = text.replace('name: "เบ็ดเตล็ด /อื่นๆ"', 'name: "งานเบ็ดเตล็ด /อื่นๆ"')

with open('src/constants.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated names successfully')

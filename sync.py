import csv, json, re
import sys
sys.stdout.reconfigure(encoding='utf-8')

categories = []
current_cat = None

with open('public/BOQ_Fixed_Original_Format.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        if not row or len(row) < 2: continue
        cat_id = row[0].strip()
        name = row[1].strip()
        qty = row[2].strip()
        unit = row[3].strip()
        try: matPrice = float(row[4].replace(',', '')) if row[4].strip() else 0
        except: matPrice = 0
        try: labPrice = float(row[5].replace(',', '')) if row[5].strip() else 0
        except: labPrice = 0

        if not current_cat or current_cat['id'] != cat_id:
            cat_names = {'1': 'งานโครงสร้างคอนกรีตเสริมเหล็ก', '2': 'งานโครงสร้าง โครงหลังคา', '3': 'งานมุงหลังคา', '4': 'งานก่อผนัง', '5': 'งานพื้น', '6': 'งานฝ้าเพดาน', '7': 'งานสี', '8': 'งานประตู', '9': 'งานหน้าต่าง', '10': 'งานไฟฟ้า', '11': 'งานสุขภัณฑ์', '12': 'งานประปา', '13': 'งานเบ็ดเตล็ด /อื่นๆ', '14': 'อุปกรณ์เพิ่มเติม/ค่าดำเนินการ'}
            current_cat = {'id': cat_id, 'name': cat_names.get(cat_id, 'Unknown'), 'items': []}
            categories.append(current_cat)
            
        item_id = f"{cat_id}.{len(current_cat['items']) + 1}"
        current_cat['items'].append({'id': item_id, 'name': name, 'qty': qty, 'unit': unit, 'matPrice': matPrice, 'laborPrice': labPrice})

with open('src/constants.js', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const initialCategories = (\[.*?\]);', text, re.DOTALL)
if match:
    new_text = text[:match.start()] + 'export const initialCategories = ' + json.dumps(categories, ensure_ascii=False, indent=2) + ';' + text[match.end():]
    with open('src/constants.js', 'w', encoding='utf-8') as f: f.write(new_text)
    print('Updated constants.js with new prices from CSV!')

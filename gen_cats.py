import csv
import json
import re

categories = {
  1: { "id": 1, "name": 'งานโครงสร้าง', "items": [] },
  2: { "id": 2, "name": 'โครงสร้าง โครงหลังคา', "items": [] },
  3: { "id": 3, "name": 'งานมุงหลังคา', "items": [] },
  4: { "id": 4, "name": 'งานผนัง', "items": [] },
  5: { "id": 5, "name": 'งานพื้น', "items": [] },
  6: { "id": 6, "name": 'งานฝ้าเพดาน', "items": [] },
  7: { "id": 7, "name": 'งานสี', "items": [] },
  8: { "id": 8, "name": 'งานประตู', "items": [] },
  9: { "id": 9, "name": 'งานหน้าต่าง', "items": [] },
  10: { "id": 10, "name": 'งานไฟฟ้า', "items": [] },
  11: { "id": 11, "name": 'งานสุขภัณฑ์', "items": [] },
  12: { "id": 12, "name": 'งานประปา', "items": [] },
  13: { "id": 13, "name": 'เบ็ดเตล็ด /อื่นๆ', "items": [] },
  14: { "id": 14, "name": 'ค่าดำเนินการ', "items": [] }
}

def clean_price(s):
    s = re.sub(r'[^\d.-]', '', s)
    return float(s) if s else 0.0

with open('public/BOQ_Fixed_Original_Format.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) < 5: continue
        try:
            catId = int(row[0])
        except:
            continue
        if catId not in categories: continue
        
        categories[catId]["items"].append({
            "id": f"{catId}.{len(categories[catId]['items']) + 1}",
            "name": row[1],
            "qty": '-',
            "unit": row[3],
            "matPrice": clean_price(row[4]),
            "laborPrice": clean_price(row[5])
        })

with open('new_cats.json', 'w', encoding='utf-8') as f:
    json.dump(list(categories.values()), f, ensure_ascii=False, indent=2)
print("Done")

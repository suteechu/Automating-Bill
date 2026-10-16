import csv

prices = {
    'แผ่นกระเบื้องซีแพคแบบเรียบ (สีมาตรฐาน)': 25,
    'ครอบสันหลังคา': 85,
    'ครอบปิดจั่ว': 95,
    'ครอบตะเข้สัน': 85,
    'ครอบปิดปลายตะเข้สัน': 100,
    'ครอบปั้นลม': 85,
    'ครอบปิดปลายปั้นลม': 90,
    'ครอบข้างติดผนัง': 85,
    'ครอบหัวผนัง': 85
}

with open('public/BOQ_Fixed_Original_Format.csv', 'r', encoding='utf-8-sig') as f:
    rows = list(csv.reader(f))

for row in rows:
    if row[0] == '3' and row[1] in prices:
        row[4] = str(prices[row[1]])

with open('public/BOQ_Fixed_Original_Format.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print('Updated flat roof tile prices')

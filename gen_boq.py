import csv

input_file = r'E:\00_PowerBI\Web\Automating-Bill\BOQ_Complete.csv'
output_file = r'E:\00_PowerBI\Web\Automating-Bill\BOQ_Pro_Wastage.csv'

with open(input_file, 'r', encoding='utf-8-sig') as f:
    reader = list(csv.reader(f))

header = ['หมวด', 'รายการวัสดุ / ค่าแรง', '% เผื่อสูญเสีย', 'ปริมาณ (ตามแบบ)', 'ปริมาณ (รวมเผื่อ)', 'หน่วย', 'ค่าวัสดุ/หน่วย', 'ค่าแรง/หน่วย', 'รวมค่าวัสดุ', 'รวมค่าแรง', 'รวมเป็นเงิน']
new_rows = [header]

for row in reader:
    if not row or row[0].strip() == 'หมวด' or row[0].strip() == '':
        continue
        
    cat = row[0]
    name = row[1]
    unit = row[3] if len(row) > 3 else ''
    mat_price = row[4] if len(row) > 4 else '0.00'
    lab_price = row[5] if len(row) > 5 else '0.00'
    
    mat_price = mat_price.replace(',', '')
    lab_price = lab_price.replace(',', '')
    if not mat_price: mat_price = '0.00'
    if not lab_price: lab_price = '0.00'
    
    wastage = '0%'
    n = name.lower()
    if any(x in n for x in ['เหล็กเส้น', 'สายเมน', 'ลวดผูก', 'ตะแกรงเหล็ก']):
        wastage = '10%'
    elif any(x in n for x in ['กระเบื้อง', 'ลามิเนต', 'คอนกรีต', 'สี', 'อิฐ', 'แผ่นพื้น', 'หลังคา', 'ท่อ pvc', 'ไม้เชิงชาย', 'บัว', 'ปูน']):
        wastage = '5%'
        
    if any(x in n for x in ['เสาเข็ม', 'ตอม่อ', 'ฐานราก', 'ประตู', 'หน้าต่าง', 'สุขภัณฑ์', 'แทงค์', 'แอร์', 'พัดลม', 'โคม', 'สวิทช์', 'ปลั๊ก', 'อ่าง', 'ตู้', 'เต้ารับ', 'กระจก', 'บ่อพัก', 'ดักกลิ่น']):
        wastage = '0%'
        
    if cat.startswith('---'):
        wastage = ''

    row_num = len(new_rows) + 1
    
    if wastage == '':
        vol_total = ''
        total_mat = ''
        total_lab = ''
        grand_total = ''
    elif 'Overhead' in name:
        wastage = ''
        vol_total = ''
        total_mat = ''
        total_lab = ''
        grand_total = f'=SUM(K2:K{row_num-1})*0.1'
    else:
        vol_total = f'=IF(ISNUMBER(D{row_num}), D{row_num}*(1+C{row_num}), 0)'
        total_mat = f'=IF(ISNUMBER(E{row_num}), E{row_num}*G{row_num}, 0)'
        total_lab = f'=IF(ISNUMBER(E{row_num}), E{row_num}*H{row_num}, 0)'
        grand_total = f'=IF(ISNUMBER(E{row_num}), I{row_num}+J{row_num}, 0)'

    new_rows.append([cat, name, wastage, '', vol_total, unit, mat_price, lab_price, total_mat, total_lab, grand_total])

with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(new_rows)

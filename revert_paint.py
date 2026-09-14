import csv
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/BOQ_Fixed_Original_Format.csv', 'r', encoding='utf-8-sig') as f:
    rows = list(csv.reader(f))

for i, row in enumerate(rows):
    if len(row) > 1 and 'TOA' in row[1]:
        name = row[1]
        
        # Determine divisor
        coverage = 150 if 'ทา 1 รอบ' in name else 75
        
        # Calculate original Mat and Lab
        try:
            mat = float(row[4].replace(',', ''))
            lab = float(row[5].replace(',', ''))
        except:
            mat, lab = 0, 0
            
        new_mat = mat / coverage
        new_lab = lab / coverage
        
        # Set Ceiling paint labor to 50
        if 'ฝ้า' in name:
            new_lab = 50.0
            row[0] = '7' # Move to Cat 7
            
        # Clean up name and unit
        row[1] = name.replace(' (กรอกเป็น ตร.ม.)', '')
        row[3] = 'ตร.ม.'
        
        # Update prices
        row[4] = f"{new_mat:.2f}".rstrip('0').rstrip('.')
        row[5] = f"{new_lab:.2f}".rstrip('0').rstrip('.')
        
with open('public/BOQ_Fixed_Original_Format.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print('Updated CSV successfully')

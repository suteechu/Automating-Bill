import * as XLSX from 'xlsx';
import { THBText } from './utils';

/**
 * ส่งออกข้อมูล BOQ ทั้งหมดเป็นไฟล์ Excel (.xlsx) อย่างเป็นมืออาชีพ
 * ประกอบด้วย 3 Sheet:
 * 1. Summary BOQ (หน้าสรุปแยกตามหมวด พร้อมกำไรดำเนินการและยอดสุทธิ)
 * 2. BOQ Details (ตารางแจกแจงรายการวัสดุและค่าแรงทุกหมวด)
 * 3. Project Variables (ตัวแปรและข้อมูลโครงการทั้งหมด)
 */
export const exportBoqToExcel = ({
  projectInfo = {},
  categories = [],
  profitMargin = 0.05,
  discountRounding = 0,
  grandTotal = 0,
  subTotal = 0,
  overheadProfit = 0,
  grandTotalMaterial = 0,
  grandTotalLabor = 0
}) => {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: Summary BOQ (สรุปงบประมาณ)
  // ==========================================
  const summaryRows = [
    ['ใบสรุปประมาณราคาค่าก่อสร้าง (SUMMARY BOQ)'],
    [''],
    ['ชื่อโครงการ:', projectInfo.name || '-', '', 'วันที่:', projectInfo.date || '-'],
    ['เจ้าของอาคาร:', projectInfo.owner || '-', '', 'สถานที่ก่อสร้าง:', projectInfo.location || '-'],
    ['ลักษณะอาคาร:', projectInfo.floors || '-', '', 'พื้นที่ใช้สอย:', `${projectInfo.area || 0} ตร.ม.`],
    [''],
    ['ลำดับ', 'หมวดหมู่งาน', 'ค่าวัสดุ (บาท)', 'ค่าแรง (บาท)', 'รวมเงิน (บาท)']
  ];

  categories.forEach((cat) => {
    let catMat = 0;
    let catLab = 0;
    (cat.items || []).forEach((item) => {
      const q = item.qty === '-' ? 0 : Number(item.qty) || 0;
      catMat += q * (Number(item.matPrice) || 0);
      catLab += q * (Number(item.laborPrice) || 0);
    });
    const catTotal = catMat + catLab;
    summaryRows.push([
      cat.id,
      cat.name,
      catMat,
      catLab,
      catTotal
    ]);
  });

  const profitPercentText = `${Math.round(profitMargin * 1000) / 10}%`;

  summaryRows.push(['']);
  summaryRows.push(['', 'รวมราคาค่าวัสดุ', grandTotalMaterial, '', '']);
  summaryRows.push(['', 'รวมราคาค่าแรง', grandTotalLabor, '', '']);
  summaryRows.push(['', 'รวมราคาค่าก่อสร้าง (Sub Total)', '', '', subTotal]);
  summaryRows.push(['', `Overheads & Profit (${profitPercentText})`, '', '', overheadProfit]);
  if (discountRounding && Number(discountRounding) !== 0) {
    summaryRows.push(['', 'หักส่วนลด / ปัดเศษ', '', '', Number(discountRounding)]);
  }
  summaryRows.push(['', 'ยอดสุทธิ (Grand Total)', '', '', grandTotal]);
  summaryRows.push(['', `(${THBText(grandTotal)})`, '', '', '']);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  
  // กำหนดความกว้างคอลัมน์ Sheet 1
  wsSummary['!cols'] = [
    { wch: 10 }, // ลำดับ
    { wch: 40 }, // หมวดหมู่งาน
    { wch: 18 }, // ค่าวัสดุ
    { wch: 18 }, // ค่าแรง
    { wch: 20 }  // รวมเงิน
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary BOQ');

  // ==========================================
  // SHEET 2: BOQ Details (รายการแจกแจงทุกหมวด)
  // ==========================================
  const detailRows = [
    ['รายการประมาณราคาค่าก่อสร้าง (BILL OF QUANTITIES: BOQ)'],
    [`โครงการ: ${projectInfo.name || '-'} | เจ้าของ: ${projectInfo.owner || '-'}`],
    [''],
    [
      'ลำดับ',
      'รายการงานก่อสร้าง',
      'ปริมาณ',
      'หน่วย',
      'ค่าวัสดุ/หน่วย',
      'รวมค่าวัสดุ',
      'ค่าแรง/หน่วย',
      'รวมค่าแรง',
      'รวมเป็นเงิน (บาท)'
    ]
  ];

  categories.forEach((cat) => {
    detailRows.push([`หมวดที่ ${cat.id}`, cat.name, '', '', '', '', '', '', '']);

    let catMat = 0;
    let catLab = 0;

    (cat.items || []).forEach((item) => {
      const q = item.qty === '-' ? 0 : Number(item.qty) || 0;
      const matP = Number(item.matPrice) || 0;
      const labP = Number(item.laborPrice) || 0;
      const totalMat = q * matP;
      const totalLab = q * labP;
      const total = totalMat + totalLab;

      catMat += totalMat;
      catLab += totalLab;

      detailRows.push([
        item.id,
        item.name,
        q > 0 ? q : '-',
        item.unit || '',
        matP > 0 ? matP : '-',
        totalMat > 0 ? totalMat : '-',
        labP > 0 ? labP : '-',
        totalLab > 0 ? totalLab : '-',
        total > 0 ? total : '-'
      ]);
    });

    detailRows.push([
      '',
      `รวม หมวดที่ ${cat.id} (${cat.name})`,
      '',
      '',
      '',
      catMat,
      '',
      catLab,
      catMat + catLab
    ]);
    detailRows.push(['']); // เว้นบรรทัด
  });

  detailRows.push(['', 'รวมราคาค่าก่อสร้างทั้งหมด (Sub Total)', '', '', '', grandTotalMaterial, '', grandTotalLabor, subTotal]);
  detailRows.push(['', `Overheads & Profit (${profitPercentText})`, '', '', '', '', '', '', overheadProfit]);
  if (discountRounding && Number(discountRounding) !== 0) {
    detailRows.push(['', 'หักส่วนลด / ปัดเศษ', '', '', '', '', '', '', Number(discountRounding)]);
  }
  detailRows.push(['', 'ยอดสุทธิ (Grand Total)', '', '', '', '', '', '', grandTotal]);

  const wsDetails = XLSX.utils.aoa_to_sheet(detailRows);

  wsDetails['!cols'] = [
    { wch: 10 }, // ลำดับ
    { wch: 45 }, // รายการ
    { wch: 12 }, // ปริมาณ
    { wch: 10 }, // หน่วย
    { wch: 14 }, // ค่าวัสดุ/หน่วย
    { wch: 16 }, // รวมค่าวัสดุ
    { wch: 14 }, // ค่าแรง/หน่วย
    { wch: 16 }, // รวมค่าแรง
    { wch: 18 }  // รวมเป็นเงิน
  ];

  XLSX.utils.book_append_sheet(wb, wsDetails, 'BOQ Details');

  // ==========================================
  // SHEET 3: Project Variables (ข้อมูลและตัวแปร)
  // ==========================================
  const variableRows = [
    ['ข้อมูลและตัวแปรโครงการก่อสร้าง (PROJECT VARIABLES)'],
    [''],
    ['ตัวแปร', 'ค่าที่ระบุ']
  ];

  Object.entries(projectInfo).forEach(([key, val]) => {
    variableRows.push([key, typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')]);
  });

  const wsVars = XLSX.utils.aoa_to_sheet(variableRows);
  wsVars['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsVars, 'Variables');

  // ตั้งชื่อไฟล์ Excel ตามชื่อเจ้าของ/โครงการ และงบประมาณ
  let formattedBudget = '';
  if (grandTotal >= 1000000) {
    formattedBudget = (grandTotal / 1000000).toFixed(1) + 'ล้าน';
  } else {
    formattedBudget = (grandTotal / 100000).toFixed(1) + 'แสน';
  }
  const ownerName = projectInfo.owner || projectInfo.name || 'Project';
  const area = projectInfo.area || 0;
  const fileName = `BOQ ${ownerName} (${area}ตรม & ${formattedBudget}).xlsx`;

  XLSX.writeFile(wb, fileName);
};

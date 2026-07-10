import { initialCategories } from './constants';

// ฟังก์ชันแปลงตัวเลขเป็นตัวอักษรภาษาไทย
export const THBText = (n) => {
  if (n === 0) return 'ศูนย์บาทถ้วน';
  n = Math.round(n * 100) / 100;
  let txtNum = n.toString().split('.');
  let baht = txtNum[0];
  let satang = txtNum.length > 1 ? txtNum[1] : '00';
  if (satang.length === 1) satang += '0';

  const tNum = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const tPos = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convert = (str) => {
    let res = '';
    for (let i = 0; i < str.length; i++) {
      let digit = parseInt(str[i]);
      let pos = str.length - i - 1;
      if (digit === 0) continue;
      if (pos === 1 && digit === 1) res += 'สิบ';
      else if (pos === 1 && digit === 2) res += 'ยี่สิบ';
      else if (pos === 0 && digit === 1 && str.length > 1 && str[str.length - 2] !== '0') res += 'เอ็ด';
      else res += tNum[digit] + tPos[pos];
    }
    return res;
  };

  let res = '';
  if (baht.length > 6) {
    let million = baht.substring(0, baht.length - 6);
    let rest = baht.substring(baht.length - 6);
    res += convert(million) + 'ล้าน' + convert(rest);
  } else {
    res += convert(baht);
  }
  res += 'บาท';
  if (satang === '00') res += 'ถ้วน';
  else res += convert(satang) + 'สตางค์';
  return res;
};

// ฟังก์ชันย่อชื่อหมวดงานสำหรับแสดงผลบนแถบเมนู (Navbar/Sidebar)
export const getShortCatName = (name) => {
  if (!name) return '';
  if (name.includes('ประตู')) return 'ประตู';
  if (name.includes('หน้าต่าง')) return 'หน้าต่าง';
  if (name.includes('โครงหลังคา')) return 'โครงหลังคา';
  if (name === 'งานฝ้า') return 'ฝ้าเพดาน';
  return name.replace('งานระบบ', '').replace('งาน', '').trim();
};

// ฟังก์ชันจัดระเบียบ ID ที่ซ้ำกัน และรับประกันว่าไม่มี field หายไป (ป้องกัน Uncontrolled Error)
export const sanitizeCategories = (cats) => {
  if (!Array.isArray(cats)) return initialCategories;
  return cats.map(cat => {
    const initialCat = initialCategories.find(c => c.id === cat.id) || {};
    const seenIds = new Set();
    const newItems = (cat.items || []).map((item) => {
      let newId = String(item.id);
      if (seenIds.has(newId)) {
        newId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      seenIds.add(newId);
      return { 
        qty: '', unit: '', name: '', matPrice: '', laborPrice: '', // Fallback เผื่อข้อมูลเก่าไม่มี
        ...item, 
        id: newId 
      };
    });
    return { ...initialCat, ...cat, items: newItems };
  });
};

// ==============================================================
// 📦 โมดูลส่วนกลางสำหรับคำนวณ Auto-Fill Quantity (ปัดขึ้นเป็นจำนวนเต็ม)
// ==============================================================

// Data-Driven Rules Engine for Quantity Calculation
const getQtyRules = (projectInfo) => {
  const getVal = (field) => parseFloat(projectInfo[field]) || 0;
  const totalArea = getVal('area');
  const roofArea = getVal('roofArea');
  const bedrooms = getVal('bedrooms');
  const bathrooms = getVal('bathrooms');
  const bathArea = getVal('bathroomArea');
  const normalCeilingArea = Math.max(0, totalArea - bathArea);
  const bedroomArea = getVal('bedroomArea');
  const kitchenArea = getVal('kitchenArea');
  const balconyArea = getVal('balconyArea');
  const washingArea = getVal('washingArea');
  const hallArea = getVal('hallArea');
  const prayerRoomArea = getVal('prayerRoomArea');
  const perimeter = getVal('perimeter');
  const beamL = getVal('beamLength');
  const aseL = getVal('aseLength');
  const rafterL = getVal('rafterLength');
  const purlinL = getVal('purlinLength');
  const foundationCount = getVal('foundationCount');
  const fasciaLength = getVal('fasciaLength');
  const intWallArea = getVal('intWallArea');
  const extWallArea = getVal('extWallArea');
  const wallVolume = getVal('totalWallVolume');

  return [
    // Roof Structure
    { keywords: ['อเส', 'อกไก่', 'ดั้ง'], calculation: () => aseL > 0 ? Math.ceil(aseL / 6) : null, exclude: ['ทาสี', 'แผ่นปิดกันนก'] },
    { keywords: ['จันทัน'], calculation: () => rafterL > 0 ? Math.ceil(rafterL / 6) : null, exclude: ['ทาสี'] },
    { keywords: ['แป'], calculation: () => purlinL > 0 ? Math.ceil(purlinL / 6) : null, exclude: ['ทาสี', 'แปลง'] },

    // Roof Area
    { keywords: ['ค่าแรงประกอบโครงหลังคา', 'ค่าแรงมุงกระเบื้อง', 'มุงเมทัลชีท', 'วัสดุสิ้นเปลืองลวดเชื่อม', 'ทาสีเหล็กโครงสร้าง', 'แผ่นหลังคาเมทัลชีท', 'ค่าแรงมุงหลังคา'], calculation: () => Math.ceil(roofArea) },
    { keywords: ['สกรูยิงเมทัลชีท'], calculation: () => Math.ceil((roofArea * 5) / 100) },
    { keywords: ['แผ่นสะท้อนความร้อน'], calculation: () => Math.ceil(roofArea * 0.0133) },
    { keywords: ['กระเบื้องซีแพค'], calculation: () => Math.ceil(roofArea * 11) },
    { keywords: ['สกรูยึดกระเบื้อง'], calculation: () => Math.ceil((roofArea * 11 * 2.2) / 250) },

    // Sanitary (catId: 11)
    { catId: '11', keywords: ['fd', 'น้ำทิ้ง'], calculation: () => Math.ceil(bathrooms * 2) },
    { catId: '11', keywords: [], calculation: () => Math.ceil(bathrooms) },

    // Ceiling
    { keywords: ['ฉาบเรียบ', 'c-line'], exclude: ['ทนชื้น'], calculation: () => Math.ceil(normalCeilingArea) },
    { keywords: ['ทนชื้น'], calculation: () => Math.ceil(bathArea) },

    // Total Area
    { keywords: ['ดินขุด', 'ดินถม', 'ทรายหยาบ', 'คอนกรีตหยาบ', 'แบบหล่อคอนกรีต', 'wiremesh', 'ไวร์เมช', 'ตะแกรงเหล็ก', 'กำจัดปลวก'], calculation: () => Math.ceil(totalArea) },
    { keywords: ['ลวดผูกเหล็ก'], calculation: () => Math.ceil(totalArea * 0.22) },
    { keywords: ['ตะปู'], calculation: () => Math.ceil(totalArea * 0.15) },
    { keywords: ['วัสดุสิ้นเปลือง'], exclude: ['หลังคา'], calculation: () => Math.ceil(totalArea) },
    { keywords: ['แผ่นพื้นสำเร็จ'], calculation: () => Math.ceil(Math.max(0, totalArea - bathArea)) },

    // Wall, Paint, Plaster
    { keywords: ['สีทารองพื้น', 'สีรองพื้น'], calculation: () => Math.ceil((intWallArea + extWallArea) / 2) },
    { keywords: ['สีทาภายใน'], calculation: () => Math.ceil(intWallArea) },
    { keywords: ['สีทาภายนอก'], calculation: () => Math.ceil(extWallArea) },
    // ... (More complex wall/plaster rules can be added here)

    // Flooring
    { keywords: ['ลามิเนต'], calculation: () => Math.ceil(bedroomArea) },
    { keywords: ['แกรนิตโต้'], calculation: () => Math.ceil(Math.max(0, totalArea - (bedroomArea + bathArea + kitchenArea + balconyArea + washingArea))) },
    { keywords: ['เซรามิค'], unitKeywords: ['16', '40'], calculation: () => Math.ceil(kitchenArea + balconyArea + washingArea) },
    { keywords: ['เซรามิค'], unitKeywords: ['12', '30'], calculation: () => Math.ceil(bathArea) },
    { keywords: ['ขัดมัน', 'ขัดหยาบ', 'ฝ้าชายคา', 'สมาร์ทบอร์ดเซาะร่อง'], calculation: () => Math.ceil(perimeter * 1.18) },

    // Beam Steel
    { keywords: ['db20'], calculation: () => Math.ceil(beamL * 6 * 2.466) },
    { keywords: ['db16'], calculation: () => Math.ceil(beamL * 6 * 1.578) },
    { keywords: ['db12'], calculation: () => Math.ceil(beamL * 6 * 0.888) },
    { keywords: ['rb9'], calculation: () => Math.ceil(beamL * 6 * 0.499) },
    { keywords: ['rb6'], calculation: () => Math.ceil(beamL * 6 * 0.222) },

    // Fascia
    { keywords: ['แผ่นปิดกันนก', 'ไม้เชิงชาย', 'scgfascia', 'ครอบข้างเมทัลชีท'], calculation: () => Math.ceil(fasciaLength) },

    // Foundation
    { keywords: ['เสาเข็มไอ', 'ฐานรากแผ่', 'สกัดหัวเข็ม', 'ขุดหลุมฐานราก'], calculation: () => Math.ceil(foundationCount) },

    // Electrical & Doors & Windows
    { keywords: ['บล็อกเครื่องทำน้ำอุ่น'], calculation: () => Math.ceil(bathrooms) },
    { keywords: ['บล็อกแอร์', 'โคมซาลาเปา'], calculation: () => Math.ceil(bedrooms + 1) },
    { keywords: ['ดาวไลท์', 'ดาวน์ไลท์'], calculation: () => Math.ceil(bedrooms * 4) },
    { keywords: ['ไฟกิ่งหน้าบ้าน', 'ไฟกิ่ง'], calculation: () => Math.ceil(bedrooms) },
    { keywords: ['บล็อกปลั๊ก', 'เต้ารับคู่', 'บล็อกสวิทช์', 'สวิทช์ทางเดียว', 'สวิตช์'], calculation: () => Math.ceil(bedrooms * 6) },
    { keywords: ['ประตูห้องน้ำ'], calculation: () => Math.ceil(bathrooms) },
    { keywords: ['ประตูภายใน'], calculation: () => Math.ceil(bedrooms) },
    { keywords: ['หน้าต่างบานกระทุ้ง'], calculation: () => Math.ceil(bathrooms) },
  ];
};

export const calculateAutoFillQty = (itemName, itemUnit, catId, projectInfo) => {
  if (!itemName) return null;
  const nameLower = itemName.toString().toLowerCase();
  const unitLower = (itemUnit || '').toString().toLowerCase().replace(/\s+/g, '');
  const rules = getQtyRules(projectInfo);

  for (const rule of rules) {
    const nameMatch = rule.keywords.length === 0 || rule.keywords.some(kw => nameLower.includes(kw));
    const unitMatch = !rule.unitKeywords || rule.unitKeywords.some(kw => unitLower.includes(kw));
    const catMatch = !rule.catId || rule.catId === String(catId);
    const excludeMatch = !rule.exclude || !rule.exclude.some(kw => nameLower.includes(kw));

    if (nameMatch && unitMatch && catMatch && excludeMatch) {
      return rule.calculation();
    }
  }

  return null; 
};
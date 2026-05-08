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
export const calculateAutoFillQty = (itemName, itemUnit, catId, projectInfo) => {
  if (!itemName) return null;
  const nameLower = itemName.toString().toLowerCase();
  const nameNoSpace = nameLower.replace(/\s+/g, '');
  const unitLower = (itemUnit || '').toString().toLowerCase().replace(/\s+/g, '');
  const isSqm = unitLower.includes('ตร.ม') || unitLower.includes('ตารางเมตร') || unitLower.includes('sqm') || unitLower.includes('ตรม');

  const getVal = (field) => parseFloat(projectInfo[field]) || 0;
  const totalArea = getVal('area');
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

  // 1. งานโครงหลังคาเหล็ก (อะเส, จันทัน, แป)
  const isSteelProfile = nameNoSpace.includes('เหล็กc') || nameNoSpace.includes('เหล็กซี') || nameNoSpace.includes('เหล็กกล่อง');
  const isRoofStructure = nameNoSpace.includes('อเส') || nameNoSpace.includes('อะเส') || nameNoSpace.includes('จันทัน') || (nameNoSpace.includes('แป') && !nameNoSpace.includes('แปลง'));
  
  if ((isSteelProfile || isRoofStructure) && !nameNoSpace.includes('ทาสี') && !nameNoSpace.includes('แผ่นปิดกันนก')) {
      if (nameNoSpace.includes('อเส') || nameNoSpace.includes('อะเส') || nameNoSpace.includes('อกไก่') || nameNoSpace.includes('ดั้ง')) {
          return aseL > 0 ? Math.ceil(aseL / 6) : null;
      }
      if (nameNoSpace.includes('จันทัน')) {
          return rafterL > 0 ? Math.ceil(rafterL / 6) : null;
      }
      if (nameNoSpace.includes('แป')) {
          return purlinL > 0 ? Math.ceil(purlinL / 6) : null;
      }
      if (isSteelProfile) return null;
  }

  // 2. พื้นที่หลังคา
  const roofKeywords = [
    'ค่าแรงประกอบโครงหลังคาเหล็ก', 'ค่าแรงมุงกระเบื้องซีแพค', 'มุงเมทัลชีท',
    'วัสดุสิ้นเปลืองลวดเชื่อม', 'ทาสีเหล็กโครงสร้าง',
    'แผ่นหลังคาเมทัลชีท', 'แผ่นหลังคาเมทัสชีล', 'ค่าแรงประกอบโครงหลังคา', 'ค่าแรงมุงซีแพค',
    'พร้อมมุงเมทัสชีล', 'ค่าแรงมุงหลังคา'
  ];
  if (roofKeywords.some(kw => nameNoSpace.includes(kw))) {
     return Math.ceil(getVal('roofArea'));
  }

  if (nameNoSpace.includes('สกรูยิงเมทัลชีท')) return Math.ceil((getVal('roofArea') * 5) / 100);
  if (nameNoSpace.includes('แผ่นสะท้อนความร้อน')) return Math.ceil(getVal('roofArea') * 0.0133);
  if (nameNoSpace.includes('กระเบื้องซีแพค') || nameNoSpace.includes('แผ่นกระเบื้องซีแพค')) return Math.ceil(getVal('roofArea') * 11);
  if (nameNoSpace.includes('สกรูยึดกระเบื้อง')) return Math.ceil((getVal('roofArea') * 11 * 2.2) / 250);

  // 3. ห้องน้ำ
  if (String(catId) === '11') {
    const isFD = nameNoSpace.includes('fd') || nameNoSpace.includes('น้ำทิ้ง');
    return Math.ceil(isFD ? bathrooms * 2 : bathrooms);
  }

  // 4. ฝ้าเพดาน
  if (nameNoSpace.includes('ฉาบเรียบ') && nameNoSpace.includes('c-line') && !nameNoSpace.includes('ทนชื้น')) return Math.ceil(normalCeilingArea);
  if (nameNoSpace.includes('ทนชื้น')) return Math.ceil(bathArea);

  // 5. พื้นที่ใช้สอย
  const areaKeywords = ['ดินขุด', 'ดินถม', 'ทรายหยาบ', 'คอนกรีตหยาบ', 'แบบหล่อคอนกรีต', 'wiremesh', 'ไวร์เมช', 'ตะแกรงเหล็ก', 'กำจัดปลวก'];
  if (areaKeywords.some(kw => nameNoSpace.includes(kw))) return Math.ceil(totalArea);
  
  if (nameNoSpace.includes('ลวดผูกเหล็ก')) return Math.ceil(totalArea * 0.22);
  if (nameNoSpace.includes('ตะปู')) return Math.ceil(totalArea * 0.15);
  
  if (nameNoSpace.includes('วัสดุสิ้นเปลือง') && !nameNoSpace.includes('หลังคา')) return Math.ceil(totalArea);
  if (nameNoSpace.includes('แผ่นพื้นสำเร็จ')) return Math.ceil(Math.max(0, totalArea - bathArea));

  // 6. งานผนัง งานสี และงานปูน
  const currentInt = getVal('intWallArea');
  const currentExt = getVal('extWallArea');
  const primerQty = (currentInt + currentExt) / 2;
  
  const wallVolume = getVal('totalWallVolume'); 
  
  let wallThickness = 0.10; 
  if (nameNoSpace.includes('17.5')) wallThickness = 0.20; 
  else if (nameNoSpace.includes('15')) wallThickness = 0.15;
  else if (nameNoSpace.includes('7.5')) wallThickness = 0.10; 
  
  const wallArea = wallVolume > 0 ? (wallVolume / wallThickness) : 0; 
  const plasterArea = (currentInt + currentExt) > 0 ? (currentInt + currentExt) : (wallArea * 2);
  
  if (nameNoSpace.includes('สีทารองพื้น') || nameNoSpace.includes('สีรองพื้น')) return Math.ceil(primerQty);
  if (nameNoSpace.includes('สีทาภายใน')) return Math.ceil(currentInt);
  if (nameNoSpace.includes('สีทาภายนอก')) return Math.ceil(currentExt);
  
  if (wallArea > 0) {
      const brickKeywords = ['ผนังก่ออิฐ', 'อิฐมวลเบา', 'อิฐมอญ', 'อิฐบล็อก', 'ก่ออิฐ'];
      if (brickKeywords.some(kw => nameNoSpace.includes(kw))) {
          if (isSqm) return Math.ceil(wallArea); 
          if (nameNoSpace.includes('มวลเบา')) return Math.ceil(wallArea * 8.33);
          if (nameNoSpace.includes('มอญ')) return Math.ceil(wallArea * 135);
          if (nameNoSpace.includes('บล็อก')) return Math.ceil(wallArea * 12.5); 
      }

      if ((nameNoSpace.includes('งานฉาบ') || nameNoSpace.includes('ฉาบปูน')) && isSqm) {
          if (nameNoSpace.includes('ภายใน')) return Math.ceil(currentInt);
          if (nameNoSpace.includes('ภายนอก')) return Math.ceil(currentExt);
          return Math.ceil(plasterArea);
      }
      
      const hasMasonryCement = nameNoSpace.includes('ปูนก่อ') || nameNoSpace.includes('ซีเมนต์ผสม');
      const hasPlasterCement = nameNoSpace.includes('ปูนฉาบ') || nameNoSpace.includes('ฉาบปูน') || nameNoSpace.includes('ฉาบทั่วไป') || nameNoSpace.includes('ฉาบสำเร็จ') || nameNoSpace.includes('/ฉาบ') || nameNoSpace.includes('ซีเมนต์ผสม');
      
      if (hasMasonryCement || hasPlasterCement) {
          let totalQty = 0;
          if (isSqm) {
              if (hasMasonryCement) totalQty += wallArea;
              if (hasPlasterCement) {
                  if (nameNoSpace.includes('ภายใน') && !nameNoSpace.includes('ภายนอก')) totalQty += currentInt;
                  else if (nameNoSpace.includes('ภายนอก') && !nameNoSpace.includes('ภายใน')) totalQty += currentExt;
                  else totalQty += plasterArea;
              }
              return Math.ceil(totalQty);
          }
          if (hasMasonryCement) totalQty += (wallArea / 3); 
          if (hasPlasterCement) {
              let currentPlasterArea = plasterArea;
              if (nameNoSpace.includes('ภายใน') && !nameNoSpace.includes('ภายนอก')) currentPlasterArea = currentInt;
              else if (nameNoSpace.includes('ภายนอก') && !nameNoSpace.includes('ภายใน')) currentPlasterArea = currentExt;
              totalQty += (currentPlasterArea / 2.5);
          }
          return Math.ceil(totalQty);
      }
  } 

  // 7. งานพื้น ลามิเนต ขัดมัน แกรนิตโต้ เซรามิค
  if (nameNoSpace.includes('ลามิเนต')) return Math.ceil(bedroomArea);
  if (nameNoSpace.includes('แกรนิตโต้')) {
    if (nameNoSpace.includes('นอน')) return Math.ceil(bedroomArea);
    if (nameNoSpace.includes('โถง') || nameNoSpace.includes('พระ')) return Math.ceil(hallArea + prayerRoomArea);
    return Math.ceil(Math.max(0, totalArea - (bedroomArea + bathArea + kitchenArea + balconyArea + washingArea)));
  }
  if (nameNoSpace.includes('เซรามิค') && (nameNoSpace.includes('16') || nameNoSpace.includes('40'))) return Math.ceil(kitchenArea + balconyArea + washingArea);
  if (nameNoSpace.includes('เซรามิค') && (nameNoSpace.includes('12') || nameNoSpace.includes('30'))) return Math.ceil(bathArea);
  if (nameNoSpace.includes('ขัดมัน') || nameNoSpace.includes('ขัดหยาบ')) return Math.ceil(perimeter * 1.18);
  if (nameNoSpace.includes('ฝ้าชายคา') || nameNoSpace.includes('สมาร์ทบอร์ดเซาะร่อง')) return Math.ceil(perimeter * 1.18);

  // 8. เหล็กคาน
  if (nameNoSpace.includes('db20')) return Math.ceil(beamL * 6 * 2.466);
  if (nameNoSpace.includes('db16')) return Math.ceil(beamL * 6 * 1.578);
  if (nameNoSpace.includes('db12')) return Math.ceil(beamL * 6 * 0.888);
  if (nameNoSpace.includes('rb9')) return Math.ceil(beamL * 6 * 0.499);
  if (nameNoSpace.includes('rb6')) return Math.ceil(beamL * 6 * 0.222);

  // 9. ความยาวเชิงชาย
  const fasciaKeywords = ['แผ่นปิดกันนก', 'ไม้เชิงชาย8', 'ไม้เชิงชาย6', 'scgfascia', 'ครอบข้างเมทัลชีท'];
  if (fasciaKeywords.some(kw => nameNoSpace.includes(kw))) return Math.ceil(getVal('fasciaLength'));

  // 10. จำนวนฐานราก
  const foundationKeywords = ['เสาเข็มไอ', 'ฐานรากแผ่', 'สกัดหัวเข็ม', 'ขุดหลุมฐานราก'];
  if (foundationKeywords.some(kw => nameNoSpace.includes(kw))) return Math.ceil(foundationCount);

  // 11. งานไฟฟ้าและเครื่องทำน้ำอุ่น
  if (nameNoSpace.includes('บล็อกเครื่องทำน้ำอุ่น')) return Math.ceil(bathrooms);
  if (nameNoSpace.includes('บล็อกแอร์')) return Math.ceil(bedrooms + 1);
  if (nameNoSpace.includes('โคมซาลาเปา')) return Math.ceil(bedrooms + 1);
  if (nameNoSpace.includes('ดาวไลท์') || nameNoSpace.includes('ดาวน์ไลท์')) return Math.ceil(bedrooms * 4);
  if (nameNoSpace.includes('ไฟกิ่งหน้าบ้าน') || nameNoSpace.includes('ไฟกิ่ง')) return Math.ceil(bedrooms);
  if (nameNoSpace.includes('บล็อกปลั๊ก') || nameNoSpace.includes('เต้ารับคู่')) return Math.ceil(bedrooms * 6);
  if (nameNoSpace.includes('บล็อกสวิทช์') || nameNoSpace.includes('สวิทช์ทางเดียว') || nameNoSpace.includes('สวิตช์')) return Math.ceil(bedrooms * 6);

  // 12. งานประตู
  const bathroomDoorKeywords = ['ประตูห้องน้ำเกร็ดไม้เนื้อแข็ง', 'ประตูห้องน้ำupvc'];
  if (bathroomDoorKeywords.some(kw => nameNoSpace.includes(kw))) return Math.ceil(bathrooms);

  const bedroomDoorKeywords = ['ประตูภายในไม้เนื้อแข็ง', 'ประตูภายในwpc', 'ประตูภายในไม้สังเคราะห์'];
  if (bedroomDoorKeywords.some(kw => nameNoSpace.includes(kw))) return Math.ceil(bedrooms);

  // 13. งานหน้าต่าง
  const bathroomWindowKeywords = ['หน้าต่างบานกระทุ้งอลูมิเนียมa1', 'หน้าต่างบานกระทุ้งอลูมิเนียมa2'];
  if (bathroomWindowKeywords.some(kw => nameNoSpace.includes(kw))) return Math.ceil(bathrooms);

  return null; 
};
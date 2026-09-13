import { initialCategories } from './constants';

// ฐานข้อมูลกลางสำหรับข้อมูลจำเพาะของเหล็กเสริม
const rebarSpecs = [
    { name: 'เหล็กเส้น DB 20 mm. (ข้ออ้อย SD40)', weight: 2.466, keywords: ['db20', 'db 20', 'ข้ออ้อย 20'] },
    { name: 'เหล็กเส้น DB 16 mm. (ข้ออ้อย SD40)', weight: 1.578, keywords: ['db16', 'db 16', 'ข้ออ้อย 16'] },
    { name: 'เหล็กเส้น DB 12 mm. (ข้ออ้อย SD40)', weight: 0.888, keywords: ['db12', 'db 12', 'ข้ออ้อย 12'] },
    { name: 'เหล็กเส้น RB 9 mm. (เหล็กกลม SR24)', weight: 0.499, keywords: ['rb9', 'rb 9', 'เหล็กกลม 9'] },
    { name: 'เหล็กเส้น RB 6 mm. (เหล็กกลม SR24)', weight: 0.222, keywords: ['rb6', 'rb 6', 'เหล็กกลม 6'] },
];

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

// ฟังก์ชันสำหรับแสดงผล Quantity ใน UI
// ถ้าค่าเป็น null, undefined, สตริงว่าง, หรือ 0 จะแสดงเป็น '-'
export const formatQtyDisplay = (qty) => {
  if (qty === null || qty === undefined || qty === '' || qty === 0 || qty === '0') {
    return '-';
  }
  return qty;
};

// ฟังก์ชันจัดระเบียบ ID ที่ซ้ำกัน และรับประกันว่าไม่มี field หายไป (ป้องกัน Uncontrolled Error)
export const sanitizeCategories = (cats) => {
  if (!Array.isArray(cats) || cats.length === 0) return initialCategories;
  const sanitized = cats.map(cat => {
    if (typeof cat !== 'object' || cat === null || !cat.id) return null;

    const initialCat = initialCategories.find(c => c.id === cat.id) || {};
    const seenIds = new Set();
    const newItems = (Array.isArray(cat.items) ? cat.items : []).map((item) => {
      if (typeof item !== 'object' || item === null || !item.id) return null;

      let newId = String(item.id);
      if (seenIds.has(newId)) {
        newId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      seenIds.add(newId);
      return { 
        qty: '', unit: '', name: '', matPrice: '', laborPrice: '',
        ...item, 
        id: newId 
      };
    }).filter(Boolean); // Filter out any null items

    return { ...initialCat, ...cat, items: newItems };
  }).filter(Boolean); // Filter out any null categories

  return sanitized.length > 0 ? sanitized : initialCategories;
};

// ==============================================================
// 📦 โมดูลส่วนกลางสำหรับคำนวณ Auto-Fill Quantity (ปัดขึ้นเป็นจำนวนเต็ม)
// ==============================================================

// Data-Driven Rules Engine for Quantity Calculation
export const getQtyRules = (projectInfo) => {
  const getVal = (field) => parseFloat(projectInfo[field]) || 0;
  const floors = projectInfo.floors || '';
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
  const _hallArea = getVal('hallArea');
  const _prayerRoomArea = getVal('prayerRoomArea');
  const perimeter = getVal('perimeter');
  const beamL = getVal('beamLength');
  const columnL = getVal('columnLength');
  const avgBeamWidth = getVal('avgBeamWidth');
  const avgBeamHeight = getVal('avgBeamHeight');
  const avgColumnWidth = getVal('avgColumnWidth');
  const avgColumnHeight = getVal('avgColumnHeight');
  const columnRebarCount = getVal('columnRebarCount') || 4; // ค่าเริ่มต้น 4 เส้น ถ้าไม่ได้กำหนด
  const aseL = getVal('aseLength');
  const rafterL = getVal('rafterLength');
  const purlinL = getVal('purlinLength');
  const foundationCount = getVal('foundationCount');
  const foundationWidth = getVal('foundationWidth') || 1.2; // Default 1.2m
  const foundationLength = getVal('foundationLength') || 1.2; // Default 1.2m
  const foundationHeight = getVal('foundationHeight') || 0.4; // Default 0.4m
  const pilesPerFoundation = getVal('pilesPerFoundation') || 1; // ค่าเริ่มต้น 1 ต้นต่อฐาน
  const fasciaLength = getVal('fasciaLength');
  const intWallArea = getVal('intWallArea');
  const extWallArea = getVal('extWallArea');
  const bathroomWallArea = getVal('bathroomWallArea');
  const kitchenWallArea = getVal('kitchenWallArea');
  const plasterThickness = getVal('plasterThickness') || 0.0125; // ค่าเริ่มต้น 1.25 ซม.
  const wallVolume = getVal('totalWallVolume');
  const slabOnGroundArea = getVal('slabOnGroundArea');
  const slabOnGroundThickness = getVal('slabOnGroundThickness') || 0.10; // ค่าเริ่มต้น 0.10 ม. ถ้าไม่ได้กำหนด
  const slabConcreteStrength = getVal('slabConcreteStrength') || 240;
  const _meterSize = projectInfo.meterSize || ''; // ขนาดมิเตอร์ไฟฟ้า เช่น '15(45)A'
  const mainCableLength = getVal('mainCableLength') || 25; // ความยาวสายเมน, ค่าเริ่มต้น 25 เมตร

  // List of variable names to check for in calculation functions
  const varNames = [
    'totalArea', 'roofArea', 'bedrooms', 'bathrooms', 'bathArea', 
    'normalCeilingArea', 'bedroomArea', 'kitchenArea', 'balconyArea', 
    'washingArea', 'hallArea', 'prayerRoomArea', 'perimeter', 'beamL', 
    'aseL', 'rafterL', 'purlinL', 'foundationCount', 'pilesPerFoundation', 'fasciaLength',
    'intWallArea', 'extWallArea', 'wallVolume', 'columnL', 'slabOnGroundArea', 'slabOnGroundThickness', 'slabConcreteStrength', 'bathroomWallArea', 'kitchenWallArea', 'columnRebarCount', 'floors', 'meterSize', 'mainCableLength', 'avgBeamWidth', 'avgBeamHeight', 'avgColumnWidth', 'avgColumnHeight', 'plasterThickness',
    'foundationWidth', 'foundationLength', 'foundationHeight',
  ];

  const rules = [
    // --- โครงสร้างหลังคา (Roof Structure) ---
    // 1. คำนวณความยาวรวม (เมตร) - สำหรับรายการที่เป็นหน่วย 'ม.'
    { description: "ความยาวอะเส (ม.)", keywords: ['อะเส', 'อกไก่', 'ดั้ง'], unitKeywords: ['ม.', 'เมตร'], calculation: () => aseL > 0 ? Math.ceil(aseL) : null, exclude: ['ท่อน', 'เส้น', 'ทาสี', 'แผ่นปิดกันนก', 'เหล็กกล่อง'] },
    { description: "ความยาวจันทัน (ม.)", keywords: ['จันทัน'], unitKeywords: ['ม.', 'เมตร'], calculation: () => rafterL > 0 ? Math.ceil(rafterL) : null, exclude: ['ท่อน', 'เส้น', 'ทาสี', 'เหล็กกล่อง'] },
    { description: "ความยาวแป (ม.)", keywords: ['แป'], unitKeywords: ['ม.', 'เมตร'], calculation: () => purlinL > 0 ? Math.ceil(purlinL) : null, exclude: ['ท่อน', 'เส้น', 'ทาสี', 'แปลง', 'เหล็กกล่อง'] },

    // 2. คำนวณเป็นท่อน (สำหรับสั่งซื้อเหล็ก) - สำหรับรายการที่เป็นหน่วย 'ท่อน' หรือ 'เส้น'
    { description: "จำนวนท่อนอะเส (ยาว 6 ม.)", keywords: ['อเส', 'อกไก่', 'ดั้ง'], unitKeywords: ['ท่อน', 'เส้น'], calculation: () => aseL > 0 ? Math.ceil(aseL / 6) : null, exclude: ['ทาสี', 'แผ่นปิดกันนก', 'เหล็กกล่อง'] },
    { description: "จำนวนท่อนจันทัน (ยาว 6 ม.)", keywords: ['จันทัน'], unitKeywords: ['ท่อน', 'เส้น'], calculation: () => rafterL > 0 ? Math.ceil(rafterL / 6) : null, exclude: ['ทาสี', 'เหล็กกล่อง'] },
    { description: "จำนวนท่อนแป (ยาว 6 ม.)", keywords: ['แป'], unitKeywords: ['ท่อน', 'เส้น'], calculation: () => purlinL > 0 ? Math.ceil(purlinL / 6) : null, exclude: ['ทาสี', 'แปลง', 'เหล็กกล่อง'] },

    { description: "พื้นที่หลังคา (ตร.ม.)", keywords: ['วัสดุสิ้นเปลือง ลวดเชื่อม,ใบตัด โครงสร้างหลังคา'], calculation: () => Math.ceil(roofArea) },

    { description: "พท.หลังคา / 75 (กล่อง/ชุด)", keywords: ['ลวดเชื่อม', 'ใบตัด'], calculation: () => Math.ceil(roofArea / 75), exclude: ['งานระบบ', 'สุขภัณฑ์', 'วัสดุสิ้นเปลือง ('] },
    
    // --- วัสดุมุงหลังคา (Roofing Material) & ค่าแรง ---
    { description: "พื้นที่หลังคา (ตร.ม.) + เผื่อ 5%", keywords: ['แผ่นหลังคาเมทัลชีท', 'แผ่นหลังคาเมทัสชีล', 'มุงเมทัลชีท'], calculation: () => Math.ceil(roofArea * 1.05), exclude: ['ค่าแรง'] },
    { description: "พื้นที่หลังคา (ตร.ม.)", keywords: ['ค่าแรงประกอบโครงหลังคา', 'ค่าแรงประกอบโครงเหล็ก', 'ค่าแรงมุงกระเบื้อง', 'ค่าแรงมุงเมทัลชีท', 'ทาสีเหล็กโครงสร้าง', 'ค่าแรงมุงหลังคา'], calculation: () => Math.ceil(roofArea), exclude: ['สีเทา'] },

    { description: "พท.หลังคา * 5 / 100 (กล่อง)", keywords: ['สกรูยิงเมทัลชีท'], calculation: () => Math.ceil((roofArea * 5) / 100) },
    { description: "พท.หลังคา * 0.0133 (ม้วน)", keywords: ['แผ่นสะท้อนความร้อน'], calculation: () => Math.ceil(roofArea * 0.0133) },
    { description: "พท.หลังคา * 11 (แผ่น)", keywords: ['กระเบื้องซีแพค'], calculation: () => Math.ceil(roofArea * 11) },
    { description: "พท.หลังคา * 11 * 2.2 / 250 (กล่อง)", keywords: ['สกรูยึดกระเบื้อง'], calculation: () => Math.ceil((roofArea * 11 * 2.2) / 250) },

    // Sanitary (catId: 11)
    { description: "จำนวนห้องน้ำ * 2 (จุด)", catId: '11', keywords: ['fd', 'น้ำทิ้ง'], calculation: () => Math.ceil(bathrooms * 2) },
    { description: "จำนวนห้องน้ำ (ชุด)", catId: '11', keywords: [], calculation: () => Math.ceil(bathrooms) },

    // Ceiling
    { description: "พท.ใช้สอย - พท.ห้องน้ำ", keywords: ['ฉาบเรียบ', 'c-line'], exclude: ['ทนชื้น'], calculation: () => Math.ceil(normalCeilingArea) },
    { description: "พื้นที่ห้องน้ำรวม (ตร.ม.)", keywords: ['ทนชื้น'], calculation: () => Math.ceil(bathArea) },

    // --- พื้น (Slab) ---
    { description: "เหล็กเสริมพื้น Wiremesh (ตร.ม.) เผื่อ 5%", keywords: ['wiremesh', 'ไวร์เมช', 'ตะแกรงเหล็ก'], calculation: () => Math.ceil(slabOnGroundArea * 1.05), exclude: ['หลังคา'] },
    ...(() => { // สร้างกฎสำหรับ RB9 บนพื้น
        const spec = rebarSpecs.find(s => s.keywords.includes('rb9'));
        return spec ? [{
            description: `เหล็กเสริมพื้น ${spec.name} (กก.)`,
            keywords: spec.keywords,
            unitKeywords: ['กก', 'kg', 'ตัน', 'ton'],
            calculation: () => Math.ceil(slabOnGroundArea * 10 * spec.weight * 1.1),
            exclude: ['ปลอก', 'คาน', 'เสา']
        }] : [];
    })(),

    // --- เหล็กปลอก (Stirrups) ---
    ...(() => {
        const spec = rebarSpecs.find(s => s.keywords.includes('rb6'));
        if (!spec) return [];
        // คำนวณเส้นรอบรูปของปลอก (ใช้ค่าจาก input ถ้ามี)
        const beamStirrupPerimeter = (avgBeamWidth > 0 && avgBeamHeight > 0) ? (avgBeamWidth + avgBeamHeight) * 2 : 1.2; // Default for 20x40 beam
        const columnStirrupPerimeter = (avgColumnWidth > 0 && avgColumnHeight > 0) ? (avgColumnWidth + avgColumnHeight) * 2 : 1.0; // Default for 20x20 col

        return [
            {
                description: `เหล็กปลอกคาน ${spec.name} (กก.) [@0.20m]`,
                keywords: ['คาน', 'ปลอก', ...spec.keywords],
                unitKeywords: ['กก', 'kg', 'ตัน', 'ton'],
                calculation: () => Math.ceil((beamL / 0.20) * beamStirrupPerimeter * spec.weight * 1.1), // เผื่อ 10%
                exclude: ['เสา', 'ตอม่อ', 'เข็ม']
            },
            {
                description: `เหล็กปลอกเสา/ตอม่อ ${spec.name} (กก.) [@0.15m]`,
                keywords: ['เสา', 'ตอม่อ', 'ปลอก', ...spec.keywords],
                unitKeywords: ['กก', 'kg', 'ตัน', 'ton'],
                calculation: () => Math.ceil((columnL / 0.15) * columnStirrupPerimeter * spec.weight * 1.1), // เผื่อ 10%
                exclude: ['คาน', 'เข็ม']
            },
            { // General rule for 'เหล็กปลอก'
                description: `เหล็กปลอก ${spec.name} (คาน+เสา) (กก.)`,
                keywords: ['ปลอก', ...spec.keywords],
                unitKeywords: ['กก', 'kg', 'ตัน', 'ton'],
                calculation: () => {
                    const beamStirrups = (beamL / 0.20) * beamStirrupPerimeter;
                    const columnStirrups = (columnL / 0.15) * columnStirrupPerimeter;
                    return Math.ceil((beamStirrups + columnStirrups) * spec.weight * 1.1);
                }, // เผื่อ 10%
                exclude: ['คาน', 'เสา', 'ตอม่อ']
            }
        ];
    })(),

    // --- เหล็กยืน (Main Bars) ---
    ...rebarSpecs.filter(s => s.name.includes('DB')).flatMap((spec, specIndex, allDbSpecs) => {
      // สร้าง list ของ keywords จากเหล็กขนาดอื่นเพื่อใช้ใน exclude
      const otherDbKeywords = allDbSpecs
        .filter((_, i) => i !== specIndex)
        .flatMap(s => s.keywords);

      return [
          {
              description: `เหล็กยืน ${spec.name} ในคาน (กก.)`,
              keywords: ['คาน', ...spec.keywords],
              unitKeywords: ['กก', 'kg', 'ตัน', 'ton'],
              calculation: () => Math.ceil(beamL * 4 * spec.weight * 1.1), // สมมติคานมีเหล็กยืน 4 เส้น, เผื่อ 10%
              exclude: ['เสา', 'ตอม่อ', 'ปลอก', 'พื้น', ...otherDbKeywords, 'เหล็กกล่อง', 'เข็ม']
          },
          {
              description: `เหล็กยืน ${spec.name} ในเสา/ตอม่อ (กก.)`,
              keywords: ['เสา', 'ตอม่อ', ...spec.keywords],
              unitKeywords: ['กก', 'kg', 'ตัน', 'ton'],
              calculation: () => Math.ceil(columnL * columnRebarCount * spec.weight * 1.1), // เผื่อ 10%
              exclude: ['คาน', 'ปลอก', 'พื้น', ...otherDbKeywords, 'เหล็กกล่อง', 'เข็ม']
          },
          { // กฎทั่วไป ต้องอยู่ท้ายสุด
              description: `เหล็กยืน ${spec.name} (ทั่วไป) (กก.)`,
              keywords: spec.keywords,
              unitKeywords: ['กก', 'kg', 'ตัน', 'ton'],
              calculation: () => Math.ceil(((beamL * 4) + (columnL * columnRebarCount)) * spec.weight * 1.1), // เผื่อ 10%
              exclude: ['คาน', 'เสา', 'ตอม่อ', 'ปลอก', 'พื้น', ...otherDbKeywords, 'เหล็กกล่อง']
          }
      ];
    }),

    // --- คอนกรีต (Concrete) ---
    {
      description: "ปริมาตรคอนกรีตหยาบฐานราก (หนา 0.10ม.) เผื่อ 10% (ลบ.ม.)",
      keywords: ['คอนกรีตหยาบ', 'lean concrete'],
      calculation: () => Math.ceil((foundationCount * foundationWidth * foundationLength * 0.10) * 1.10),
      exclude: ['โครงสร้าง', 'คาน', 'เสา', 'พื้น', 'ฟุตติ้ง']
    },
    {
      description: "ปริมาตรคอนกรีตฐานราก เผื่อ 10% (ลบ.ม.)",
      keywords: ['คอนกรีตฐานราก', 'คอนกรีตฟุตติ้ง', 'footing'],
      calculation: () => Math.ceil((foundationCount * foundationWidth * foundationLength * foundationHeight) * 1.10),
      exclude: ['หยาบ', 'โครงสร้าง', 'คาน', 'เสา', 'พื้น']
    },
    {
      description: "ปริมาตรคอนกรีตคาน เผื่อ 5% (ลบ.ม.)",
      keywords: ['คอนกรีตคาน'],
      calculation: () => Math.ceil((beamL * avgBeamWidth * avgBeamHeight) * 1.05),
      exclude: ['เสา', 'ตอม่อ', 'โครงสร้าง']
    },
    {
      description: "ปริมาตรคอนกรีตเสา/ตอม่อ เผื่อ 5% (ลบ.ม.)",
      keywords: ['คอนกรีตเสา', 'คอนกรีตตอม่อ'],
      calculation: () => Math.ceil((columnL * avgColumnWidth * avgColumnHeight) * 1.05),
      exclude: ['คาน', 'โครงสร้าง']
    },
    { // กฎทั่วไปสำหรับคอนกรีตโครงสร้าง
      description: "ปริมาตรคอนกรีต (คาน + เสา) เผื่อ 5% (ลบ.ม.)",
      keywords: ['คอนกรีตโครงสร้าง'],
      calculation: () => { const beamVolume = beamL * avgBeamWidth * avgBeamHeight; const columnVolume = columnL * avgColumnWidth * avgColumnHeight; return Math.ceil((beamVolume + columnVolume) * 1.05); }, exclude: ['หยาบ', 'พื้น', 'คาน', 'เสา', 'ตอม่อ']
    },

    // สูตรสำหรับคอนกรีตพื้น (Slab on Ground)
    // ปริมาตร = พื้นที่ SOG * ความหนา * เผื่อ 10%
    {
      description: `ปริมาตรคอนกรีตพื้น/ผสมเสร็จ (จาก พท.ใช้สอยรวม) ${slabConcreteStrength}ksc (หนา ${slabOnGroundThickness}ม.) เผื่อ 10% (ลบ.ม.)`,
      keywords: ['คอนกรีตพื้น', 'พื้นคอนกรีต', 'slab on ground', 'sog', `${slabConcreteStrength}ksc`, `${slabConcreteStrength} ksc`, 'ready mix', 'เป็นคิว'],
      calculation: () => Math.ceil(totalArea * slabOnGroundThickness * 1.10),
      exclude: ['หยาบ', 'โครงสร้าง']
    },

    // --- ไม้แบบ (Formwork) ---
    {
      description: "พื้นที่ไม้แบบเสา (ตร.ม.)",
      keywords: ['ไม้แบบเสา', 'แบบหล่อเสา', 'ไม้แบบตอม่อ'],
      calculation: () => Math.ceil(columnL * (avgColumnWidth * 2 + avgColumnHeight * 2)),
      exclude: ['คาน']
    },
    {
      description: "พื้นที่ไม้แบบคาน (ตร.ม.)",
      keywords: ['ไม้แบบคาน', 'แบบหล่อคาน'],
      calculation: () => Math.ceil(beamL * (avgBeamHeight * 2 + avgBeamWidth)),
      exclude: ['เสา', 'ตอม่อ']
    },
    {
      description: "พื้นที่ไม้แบบ (คาน + เสา) (ตร.ม.)",
      keywords: ['ไม้แบบ', 'แบบหล่อคอนกรีต'],
      calculation: () => {
        const beamFormwork = beamL * (avgBeamHeight * 2 + avgBeamWidth);
        const columnFormwork = columnL * (avgColumnWidth * 2 + avgColumnHeight * 2);
        return Math.ceil(beamFormwork + columnFormwork);
      },
      exclude: ['พื้น', 'ฐานราก', 'เสาเข็ม', 'คาน', 'เสา', 'ตอม่อ']
    },

    // Total Area & General
    { description: "พื้นที่ใช้สอยรวม (ตร.ม.)", keywords: ['ดินขุด', 'ดินถม', 'ทรายหยาบ', 'คอนกรีตหยาบ', 'กำจัดปลวก'], calculation: () => Math.ceil(totalArea) },
    { description: "พท.ใช้สอย * 0.22 (กก.)", keywords: ['ลวดผูกเหล็ก'], calculation: () => Math.ceil(totalArea * 0.22) },
    { description: "พท.ใช้สอย * 0.15 (กก.)", keywords: ['ตะปู'], calculation: () => Math.ceil(totalArea * 0.15) },
    { description: "พื้นที่ใช้สอยรวม (ตร.ม.)", keywords: ['วัสดุสิ้นเปลือง (ลวดเชื่อม, ใบตัด)'], exclude: ['โครงสร้างหลังคา', 'โครงหลังคา'], calculation: () => Math.ceil(totalArea) },
    { description: "พท.ใช้สอย - พท.ห้องน้ำ", keywords: ['งานแผ่นพื้นสำเร็จรูป (รวมค่าแรงวาง)'], calculation: () => Math.ceil(Math.max(0, totalArea - bathArea)) },

    // Wall, Paint, Plaster
    { description: "พื้นที่ผนังห้องน้ำ (ตร.ม.)", keywords: ['ผนังปูกระเบื้อง 6x12สูงชนฝ้า(ห้องน้ำ)'], calculation: () => Math.ceil(bathroomWallArea) },
    { description: "พื้นที่ผนังห้องครัว (ตร.ม.)", keywords: ['ผนังปูกระเบื้อง 6x12(ห้องครัว)'], calculation: () => Math.ceil(kitchenWallArea) },
    { description: "พื้นที่ผนังรวม (ตร.ม.) [คำนวณจากปริมาตรหรือพื้นที่]", keywords: ['ผนังก่ออิฐมวลเบา'], calculation: () => wallVolume > 0 ? Math.ceil(wallVolume / 0.08) : Math.ceil(intWallArea + extWallArea), exclude: ['17.5'] }, // ค่าแรงก่ออิฐมวลเบา (8 ซม.)
    { description: "พื้นที่ผนังรวม (ตร.ม.) [คำนวณจากปริมาตรหรือพื้นที่]", keywords: ['ผนังก่ออิฐมอญ'], calculation: () => wallVolume > 0 ? Math.ceil(wallVolume / 0.08) : Math.ceil(intWallArea + extWallArea), exclude: ['17.5'] }, // ค่าแรงก่ออิฐมอญ (8 ซม.)
    { description: "พื้นที่ผนังรวม (ตร.ม.) [คำนวณจากปริมาตรหรือพื้นที่]", keywords: ['ผนังก่ออิฐบล็อก'], calculation: () => wallVolume > 0 ? Math.ceil(wallVolume / 0.07) : Math.ceil(intWallArea + extWallArea), exclude: ['17.5'] }, // ค่าแรงก่ออิฐบล็อก (7 ซม.)
    { description: "พท.ผนังรวม * 8.33 * 1.05 (ก้อน) [จากปริมาตรหรือพื้นที่]", keywords: ['อิฐมวลเบา'], calculation: () => Math.ceil((wallVolume > 0 ? (wallVolume / 0.08) : (intWallArea + extWallArea)) * 8.33 * 1.05), exclude: ['ก่อ', 'ผนังก่อ'] }, // วัสดุอิฐมวลเบา (8 ซม.)
    { description: "พท.ผนังรวม * 125 * 1.05 (ก้อน) [จากปริมาตรหรือพื้นที่]", keywords: ['อิฐมอญ'], calculation: () => Math.ceil((wallVolume > 0 ? (wallVolume / 0.08) : (intWallArea + extWallArea)) * 125 * 1.05), exclude: ['ก่อ', 'ผนังก่อ'] }, // วัสดุอิฐมอญ (8 ซม.)
    { description: "พท.ผนังรวม * 13 * 1.05 (ก้อน) [จากปริมาตรหรือพื้นที่]", keywords: ['อิฐบล็อก'], calculation: () => Math.ceil((wallVolume > 0 ? (wallVolume / 0.07) : (intWallArea + extWallArea)) * 13 * 1.05), exclude: ['ก่อ', 'ผนังก่อ'] }, // วัสดุอิฐบล็อก (7 ซม.)
    {
      description: 'ปริมาณปูนก่ออิฐมวลเบา (ถุง 50kg) @ 25 ตร.ม./ถุง',
      keywords: ['ปูนก่อ', 'อิฐมวลเบา'],
      calculation: () => Math.ceil((intWallArea + extWallArea) / 25),
      exclude: ['ฉาบ', 'สำเร็จรูป', 'อิฐมอญ', 'อิฐบล็อก']
    },
    {
      description: 'ปริมาณปูนก่ออิฐมอญ (ถุง 50kg) @ 10 ตร.ม./ถุง',
      keywords: ['ปูนก่อ', 'อิฐมอญ'],
      calculation: () => Math.ceil((intWallArea + extWallArea) / 10),
      exclude: ['ฉาบ', 'สำเร็จรูป', 'อิฐมวลเบา', 'อิฐบล็อก']
    },
    {
      description: 'ปริมาณปูนก่ออิฐบล็อก (ถุง 50kg) @ 13 ตร.ม./ถุง',
      keywords: ['ปูนก่อ', 'อิฐบล็อก'],
      calculation: () => Math.ceil((intWallArea + extWallArea) / 13),
      exclude: ['ฉาบ', 'สำเร็จรูป', 'อิฐมวลเบา', 'อิฐมอญ']
    },
    {
      description: 'ปริมาณปูนฉาบสำเร็จรูป (ถุง 50kg) เผื่อ 5%',
      keywords: ['ปูนฉาบ', 'ปูนซีเมนต์สำเร็จรูป'], // ใช้ keyword ที่ทั่วไปมากขึ้น
      calculation: () => {
        // 1. คำนวณพื้นที่ฉาบรวม โดยผนังภายในฉาบ 2 ด้าน, ผนังภายนอกฉาบ 1 ด้าน
        const totalPlasterArea = (intWallArea * 2) + extWallArea;

        // 2. คำนวณปริมาตรปูนฉาบที่ต้องการ (ลบ.ม.)
        const totalPlasterVolume = totalPlasterArea * plasterThickness;

        // 3. คำนวณจำนวนถุงที่ต้องใช้
        // สมมติฐาน: ปูนฉาบ 1 ถุง (50 กก.) ผสมน้ำแล้วได้ปริมาตรประมาณ 0.029 ลบ.ม.
        const volumePerBag = 0.029;
        const bags = totalPlasterVolume / volumePerBag;

        // 4. เผื่อ 5% สำหรับการสูญเสีย
        return Math.ceil(bags * 1.05);
      },
      exclude: ['สกิมโค้ท', 'skimread', 'ปูนกาว', 'ปูนก่อ', 'ปูนเท']
    },

    // --- งานสี (Paint) ---
    // กฎสำหรับคำนวณพื้นที่ (ตร.ม.)
    {
      description: "พื้นที่ผนังรวม (ตร.ม.)",
      keywords: ['สีรองพื้น', 'รองพื้นปูนใหม่', 'รองพื้นปูนเก่า'],
      unitKeywords: ['ตร.ม.', 'ตรม', 'm2'],
      calculation: () => Math.ceil(intWallArea + extWallArea),
      catId: '7'
    },
    {
      description: "พื้นที่ผนังภายใน (ตร.ม.)",
      keywords: ['สีทาภายใน'],
      unitKeywords: ['ตร.ม.', 'ตรม', 'm2'],
      calculation: () => Math.ceil(intWallArea),
      catId: '7'
    },
    {
      description: "พื้นที่ผนังภายนอก (ตร.ม.)",
      keywords: ['สีทาภายนอก'],
      unitKeywords: ['ตร.ม.', 'ตรม', 'm2'],
      calculation: () => Math.ceil(extWallArea),
      catId: '7'
    },
    {
      description: "พื้นที่ทาสีฝ้าเพดานภายใน (ตร.ม.)",
      keywords: ['สีฝ้า', 'ทาฝ้า'],
      unitKeywords: ['ตร.ม.', 'ตรม', 'm2'],
      calculation: () => Math.ceil(normalCeilingArea),
      exclude: ['ชายคา', 'ภายนอก', 'ทนชื้น', 'ผนัง', 'c-line', 'โครง']
    },
    // กฎสำหรับคำนวณปริมาณสี (แกลลอน) @ 32 ตร.ม./เที่ยว
    {
      description: "ปริมาณสีรองพื้น (แกลลอน) [1 เที่ยว]",
      keywords: ['สีรองพื้น', 'รองพื้นปูนใหม่', 'รองพื้นปูนเก่า'],
      unitKeywords: ['แกลลอน', 'gallon'],
      calculation: () => Math.ceil((intWallArea + extWallArea) / 32),
      catId: '7'
    },
    {
      description: "ปริมาณสีทาภายนอก (แกลลอน) [2 เที่ยว]",
      keywords: ['สีทาภายนอก'],
      unitKeywords: ['แกลลอน', 'gallon'],
      calculation: () => Math.ceil(extWallArea / 16),
      catId: '7'
    },
    {
      description: "ปริมาณสีทาภายใน (แกลลอน) [2 เที่ยว]",
      keywords: ['สีทาภายใน'],
      unitKeywords: ['แกลลอน', 'gallon'],
      calculation: () => Math.ceil(intWallArea / 16),
      catId: '7'
    },
    {
      description: "ปริมาณสีทาฝ้าภายใน (แกลลอน) [2 เที่ยว]",
      keywords: ['สีฝ้า', 'ทาฝ้า'],
      unitKeywords: ['แกลลอน', 'gallon'],
      calculation: () => Math.ceil(normalCeilingArea / 16),
      exclude: ['ชายคา', 'ภายนอก', 'ผนัง', 'รองพื้น', 'c-line', 'โครง']
    },
    // กฎสำหรับคำนวณปริมาณสี (ถัง 5 แกลลอน) @ 80 ตร.ม./2 เที่ยว
    {
      description: "ปริมาณสีรองพื้น (ถัง) [1 เที่ยว]",
      keywords: ['สีรองพื้น', 'รองพื้นปูนใหม่', 'รองพื้นปูนเก่า'],
      unitKeywords: ['ถัง', 'bucket', '5แกลลอน', '5gallon'],
      calculation: () => Math.ceil((intWallArea + extWallArea) / 160),
      catId: '7'
    },
    {
      description: "ปริมาณสีทาภายนอก (ถัง) [2 เที่ยว]",
      keywords: ['สีทาภายนอก'],
      unitKeywords: ['ถัง', 'bucket', '5แกลลอน', '5gallon'],
      calculation: () => Math.ceil(extWallArea / 80),
      catId: '7'
    },
    {
      description: "ปริมาณสีทาภายใน (ถัง) [2 เที่ยว]",
      keywords: ['สีทาภายใน'],
      unitKeywords: ['ถัง', 'bucket', '5แกลลอน', '5gallon'],
      calculation: () => Math.ceil(intWallArea / 80),
      catId: '7'
    },
    {
      description: "ปริมาณสีทาฝ้าภายใน (ถัง) [2 เที่ยว]",
      keywords: ['สีฝ้า', 'ทาฝ้า'],
      unitKeywords: ['ถัง', 'bucket', '5แกลลอน', '5gallon'],
      calculation: () => Math.ceil(normalCeilingArea / 80),
      exclude: ['ชายคา', 'ภายนอก', 'ผนัง', 'รองพื้น', 'c-line', 'โครง']
    },

    // --- งานสีไม้เชิงชายและฝ้าชายคา ---
    {
      description: "พื้นที่ทาสีไม้เชิงชายและฝ้าชายคา (ตร.ม.)",
      keywords: ['สีทาไม้เชิงชาย', 'สีทาฝ้าชายคา', 'สีทาไม้เทียม', 'สีน้ำมัน'],
      unitKeywords: ['ตร.ม.', 'ตรม', 'm2'],
      calculation: () => {
        const fasciaArea = fasciaLength * 0.2; // สมมติเชิงชายกว้าง 20 ซม.
        const soffitArea = perimeter * 1.18; // ใช้สูตรเดียวกับ 'ฝ้าชายคา'
        return Math.ceil(fasciaArea + soffitArea);
      },
      catId: '7',
      exclude: ['ผนัง', 'ภายใน', 'ภายนอก', 'รองพื้น']
    },
    {
      description: "ปริมาณสีทาไม้เชิงชาย/ฝ้าชายคา (แกลลอน) [2 เที่ยว]",
      keywords: ['สีทาไม้เชิงชาย', 'สีทาฝ้าชายคา', 'สีทาไม้เทียม', 'สีน้ำมัน'],
      unitKeywords: ['แกลลอน', 'gallon'],
      calculation: () => {
        const fasciaArea = fasciaLength * 0.2; // สมมติเชิงชายกว้าง 20 ซม.
        const soffitArea = perimeter * 1.18; // ใช้สูตรเดียวกับ 'ฝ้าชายคา'
        const totalArea = fasciaArea + soffitArea;
        return Math.ceil(totalArea / 16); // 16 ตร.ม. / แกลลอน (2 เที่ยว)
      },
      catId: '7',
      exclude: ['ผนัง', 'ภายใน', 'ภายนอก', 'รองพื้น']
    },
    {
      description: "ปริมาณสีทาไม้เชิงชาย/ฝ้าชายคา (ถัง) [2 เที่ยว]",
      keywords: ['สีทาไม้เชิงชาย', 'สีทาฝ้าชายคา', 'สีทาไม้เทียม', 'สีน้ำมัน'],
      unitKeywords: ['ถัง', 'bucket', '5แกลลอน', '5gallon'],
      calculation: () => {
        const fasciaArea = fasciaLength * 0.2; // สมมติเชิงชายกว้าง 20 ซม.
        const soffitArea = perimeter * 1.18; // ใช้สูตรเดียวกับ 'ฝ้าชายคา'
        const totalArea = fasciaArea + soffitArea;
        return Math.ceil(totalArea / 80); // 80 ตร.ม. / ถัง (2 เที่ยว)
      },
      catId: '7',
      exclude: ['ผนัง', 'ภายใน', 'ภายนอก', 'รองพื้น']
    },

    // --- งานบัว (Skirting) ---
    {
      description: "ความยาวบัวเชิงผนัง (ม.) [คำนวณจาก พท.ผนังภายใน]",
      keywords: ['บัวผนัง', 'บัวพื้น', 'skirting'],
      unitKeywords: ['ม.', 'เมตร'],
      calculation: () => Math.ceil(intWallArea / 2.7) // สมมติความสูงฝ้าเฉลี่ย 2.7 เมตร
    },

    // Flooring
    { description: "พื้นที่ห้องนอนรวม (ตร.ม.)", keywords: ['พื้นไม้ลามิเนตพร้อมตัวจบ ห้องนอน', 'กระเบื้องแกรนิตโต้ 24x24ผิวมัน ห้องนอน'], calculation: () => Math.ceil(bedroomArea) },
    { description: "พท.โถงและอื่นๆ", keywords: ['กระเบื้องแกรนิตโต้ 24x24ผิวมัน ห้องโถง ห้องพระ'], calculation: () => Math.ceil(Math.max(0, totalArea - (bedroomArea + bathArea + kitchenArea + balconyArea + washingArea))) },
    // --- กระเบื้องพื้นตามห้อง (ใช้ catId: 5 'งานพื้น' เพื่อความแม่นยำ) ---
    { description: "พื้นที่ห้องน้ำ (พื้น)", catId: '5', keywords: ['กระเบื้องเซรามิค12x12ผิวด้าน ห้องน้ำ'], calculation: () => Math.ceil(bathArea), exclude: ['ผนัง'] },
    { description: "พท.ครัว+ระเบียง+ซักล้าง (พื้น)", catId: '5', keywords: ['กระเบื้องเซรามิค16x16ผิวด้าน ครัว ระเบียง ซักล้าง'], calculation: () => Math.ceil(kitchenArea + balconyArea + washingArea), exclude: ['ผนัง'] },

    // --- ปูนกาว (Tile Adhesive) ---
    // 1. กฎสำหรับงานผนัง (เรียงจากเฉพาะไปทั่วไป)
    {
      description: "ปูนกาวสำหรับผนังภายนอก (กระสอบ 20 กก.) @ 4.5 ตร.ม./กระสอบ",
      keywords: ['ปูนกาวภายนอก', 'ปูนกาว ผนังภายนอก'],
      unitKeywords: ['กระสอบ', 'ถุง'],
      calculation: () => Math.ceil(extWallArea / 4.5)
    },
    {
      description: "ปูนกาวสำหรับผนังห้องครัว (กระสอบ 20 กก.) @ 4.5 ตร.ม./กระสอบ",
      keywords: ['ปูนกาว', 'ห้องครัว'],
      unitKeywords: ['กระสอบ', 'ถุง'],
      calculation: () => Math.ceil(kitchenWallArea / 4.5),
      exclude: ['พื้น', 'ภายนอก', 'ห้องน้ำ', 'ซ่อม']
    },
    {
      description: "ปูนกาวสำหรับผนังห้องน้ำ (กระสอบ 20 กก.) @ 4.5 ตร.ม./กระสอบ",
      keywords: ['ปูนกาว', 'ห้องน้ำ'],
      unitKeywords: ['กระสอบ', 'ถุง'],
      calculation: () => Math.ceil(bathroomWallArea / 4.5),
      exclude: ['พื้น', 'ภายนอก', 'ห้องครัว', 'ซ่อม']
    },
    {
      description: "ปูนกาวผนัง (กระเบื้องเล็ก-กลาง) (กระสอบ 20 กก.) @ 4.5 ตร.ม./กระสอบ",
      keywords: ['ปูนกาว', 'ผนัง'],
      unitKeywords: ['กระสอบ', 'ถุง'],
      calculation: () => Math.ceil((intWallArea + extWallArea) / 4.5),
      exclude: ['พื้น', 'ภายนอก', 'ห้องครัว', 'ห้องน้ำ', 'ซ่อม']
    },
    // 2. กฎสำหรับงานพื้น (จะทำงานเมื่อไม่ตรงกับกฎงานผนัง)
    {
      description: "ปูนกาวพื้น (แกรนิตโต้/ทั่วไป) (กระสอบ 20 กก.) @ 4.5 ตร.ม./กระสอบ",
      keywords: ['ปูนกาว', 'ปูนพื้น'],
      unitKeywords: ['กระสอบ', 'ถุง'],
      calculation: () => Math.ceil(Math.max(0, totalArea - bathArea) / 4.5),
      exclude: ['ผนัง', 'ซ่อม']
    },

    { description: "เส้นรอบรูป * 1.18", keywords: ['ขัดมัน', 'ขัดหยาบ', 'ฝ้าชายคา', 'สมาร์ทบอร์ดเซาะร่อง'], calculation: () => Math.ceil(perimeter * 1.18) },

    // Fascia
    { description: "ความยาวเชิงชาย (ม.)", keywords: ['แผ่นปิดกันนก', 'ไม้เชิงชาย', 'scgfascia', 'ครอบข้างเมทัลชีท'], calculation: () => fasciaLength > 0 ? Math.ceil(fasciaLength) : null },

    // --- Foundation ---
    {
      description: "จำนวนเสาเข็ม/ตอม่อทั้งหมด (ต้น)",
      keywords: ['เสาเข็ม', 'เสาตอม่อ'],
      calculation: () => foundationCount > 0 ? Math.ceil(foundationCount * pilesPerFoundation) : null,
      // ไม่นับรวมงานที่คิดเป็น 'หลุม' เช่น สกัดหัวเข็ม, ขุดหลุม, ฐานราก เพื่อให้ไป match กฎถัดไป
      exclude: ['สกัดหัวเข็ม', 'ค่าขนย้าย', 'ทดสอบ', 'ขุดหลุม', 'ฐานราก']
    },
    {
      description: "จำนวนฐานราก/ตอม่อ (หลุม)",
      keywords: ['เสาตอม่อ', 'ฐานรากเข็ม', 'ฐานรากแผ่', 'สกัดหัวเข็ม', 'ขุดหลุมฐานราก'],
      calculation: () => foundationCount > 0 ? Math.ceil(foundationCount) : null
    },

    // --- Septic Tank Logic ---
    {
      description: "ถัง 1000L สำหรับ 1-2 ห้องน้ำ",
      keywords: ['ถังบำบัดน้ำเสีย (1,000 ลิตร)'],
      calculation: () => (bathrooms >= 1 && bathrooms <= 2) ? 1 : 0,
      catId: '12'
    },
    {
      description: "ถัง 1600L สำหรับ 3-4 ห้องน้ำ (หรือมากกว่า)",
      keywords: ['ถังบำบัดน้ำเสีย (1,600 ลิตร)'],
      calculation: () => (bathrooms >= 3) ? 1 : 0,
      catId: '12'
    },
    // --- Water Tank & Pump Logic ---
    {
      description: "แทงค์น้ำ 1000L + ปั๊ม 150W (สำหรับบ้าน 1 ชั้น, 1-2 ห้องน้ำ)",
      keywords: ['150w'],
      unitKeywords: ['เหมา', 'ชุด', 'lump sum'],
      calculation: () => ((floors.includes('ชั้นเดียว') || floors.includes('ชั้นครึ่ง')) && bathrooms >= 1 && bathrooms <= 2) ? 1 : 0,
      catId: '12'
    },
    {
      description: "แทงค์น้ำ 1000L + ปั๊ม 200-250W (สำหรับบ้าน 2 ชั้น/2-3 ห้องน้ำ หรือ บ้าน 1 ชั้น/3 ห้องน้ำ)",
      keywords: ['200w', '250w'],
      unitKeywords: ['เหมา', 'ชุด', 'lump sum'],
      calculation: () => ((floors.includes('สองชั้น') && bathrooms >= 2 && bathrooms <= 3) || ((floors.includes('ชั้นเดียว') || floors.includes('ชั้นครึ่ง')) && bathrooms === 3)) ? 1 : 0,
      catId: '12'
    },
    {
      description: "แทงค์น้ำขนาดใหญ่ + ปั๊ม 300-400W (สำหรับบ้าน 3 ชั้น+ หรือห้องน้ำเยอะ)",
      keywords: ['300w', '400w'],
      unitKeywords: ['เหมา', 'ชุด', 'lump sum'],
      // บ้าน 3 ชั้นขึ้นไป (ไม่มีในตัวเลือก แต่เผื่อไว้), หอพัก, อพาร์ทเม้นท์ หรือมีห้องน้ำ 4 ห้องขึ้นไป
      calculation: () => (floors.includes('สามชั้น') || floors.includes('หอพัก') || floors.includes('อพาร์ทเม้นท์') || bathrooms >= 4) ? 1 : 0,
      catId: '12'
    },
    {
      description: "บ่อพักสำเร็จรูป ตามจำนวนห้องน้ำ (ม.)",
      keywords: ['บ่อพักสำเร็จรูป'],
      calculation: () => {
        if (bathrooms >= 3 && bathrooms <= 4) return 15;
        if (bathrooms >= 1 && bathrooms <= 2) return 10;
        return 0;
      },
      catId: '12'
    },
    {
      description: "ท่อ PVC 4 นิ้ว (ส้วม/น้ำทิ้ง) ตามจำนวนห้องน้ำ (ม.)",
      keywords: ['pvc 4"', 'pvc 4 นิ้ว', 'น้ำทิ้งหลัก', 'ระบายส้วม', 'โสโครก'],
      calculation: () => {
        if (bathrooms >= 3 && bathrooms <= 4) return 15;
        if (bathrooms >= 1 && bathrooms <= 2) return 10;
        return 0;
      },
      catId: '12',
      exclude: ['น้ำดี']
    },
    {
      description: "ท่อ PVC 3 นิ้ว (น้ำทิ้ง/รางน้ำ) ตามจำนวนห้องน้ำ (ม.)",
      keywords: ['pvc 3"', 'pvc 3 นิ้ว', 'น้ำทิ้ง', 'รางน้ำ'],
      calculation: () => {
        if (bathrooms >= 3 && bathrooms <= 4) return 20;
        if (bathrooms >= 1 && bathrooms <= 2) return 10;
        return 0;
      },
      catId: '12',
      exclude: ['น้ำดี', 'ประปา']
    },
    {
      description: "ท่อ PVC 2 นิ้ว (น้ำทิ้งอ่าง/พื้น) ตามจำนวนห้องน้ำ (ม.)",
      keywords: ['pvc 2"', 'pvc 2 นิ้ว', 'น้ำทิ้งอ่าง', 'น้ำทิ้งพื้น'],
      calculation: () => {
        if (bathrooms >= 3 && bathrooms <= 4) return 7;
        if (bathrooms >= 1 && bathrooms <= 2) return 5;
        return 0;
      },
      catId: '12',
      exclude: ['น้ำดี', 'ประปา']
    },
    {
      description: "ท่อ PVC 3/4 นิ้ว (น้ำประปา) ตามจำนวนห้องน้ำ (ม.)",
      keywords: ['pvc 3/4"', 'pvc 3/4 นิ้ว', '6 หุน', 'น้ำประปา', 'น้ำดี'],
      calculation: () => {
        if (bathrooms >= 3 && bathrooms <= 4) return 30;
        if (bathrooms >= 1 && bathrooms <= 2) return 20;
        return 0;
      },
      catId: '12',
      exclude: ['น้ำทิ้ง', 'โสโครก']
    },

    // --- Main Electrical Cable Rules (สายเมนไฟฟ้า) ---
    {
      description: "สายเมนที่ระบุ 'รวมไม่เกิน 25 เมตร'",
      keywords: ['สายเมน', 'รวมไม่เกิน 25 เมตร'],
      unitKeywords: ['ม.', 'เมตร'],
      calculation: () => 25,
      catId: '10',
    },
    {
      description: "สายเมน (เมตร) สำหรับมิเตอร์ 15(45)A",
      keywords: ['สายเมน', '15(45)a'],
      unitKeywords: ['ม.', 'เมตร'],
      // การกรองมิเตอร์ 15(45)A จะทำผ่าน keywords และ exclude อยู่แล้ว
      // จึงสามารถคำนวณค่าโดยตรงได้เลย ทำให้ไม่ต้องกรอกข้อมูล meterSize ในฟอร์ม
      calculation: () => Math.ceil(mainCableLength),
      catId: '10',
      exclude: ['30(100)', 'รวมไม่เกิน 25 เมตร']
    },
    {
      description: "สายเมน (เหมา/ชุด) สำหรับมิเตอร์ 15(45)A",
      keywords: ['สายเมน', '15(45)a'],
      unitKeywords: ['เหมา', 'lump sum', 'job', 'งาน', 'ชุด'],
      calculation: () => 1,
      catId: '10',
      exclude: ['30(100)']
    },
    {
      description: "สายเมน (เมตร) สำหรับมิเตอร์ 30(100)A",
      keywords: ['สายเมน', '30(100)a'],
      unitKeywords: ['ม.', 'เมตร'],
      calculation: () => Math.ceil(mainCableLength),
      catId: '10',
      exclude: ['15(45)', 'รวมไม่เกิน 25 เมตร']
    },
    {
      description: "สายเมน (เหมา/ชุด) สำหรับมิเตอร์ 30(100)A",
      keywords: ['สายเมน', '30(100)a'],
      unitKeywords: ['เหมา', 'lump sum', 'job', 'งาน', 'ชุด'],
      calculation: () => 1,
      catId: '10',
      exclude: ['15(45)']
    },

    // General Lump Sum / Job-based items
    {
      description: "รายการเหมา/งาน (ค่าดำเนินการ, ค่าขนส่ง, งานติดตั้ง, อื่นๆ)",
      // รวมคำสำคัญทั่วไปสำหรับงานเหมา และคำเฉพาะจากที่คุณยกตัวอย่างมา
      keywords: [
        'เหมา', 'lump sum', 'ค่าดำเนินการ', 'ค่าขนส่ง', 'ทำความสะอาด',
        'ทดสอบระบบ', 'ค่าแรงติดตั้ง', 'อุปกรณ์ต่อท่อ', 'สีน้ำมันทาวงกบ', 'ไฟระย้า',
        'แชนเดอเลียร์', 'ตู้โหลด', 'consumer unit'
      ],
      calculation: () => 1,
      // นำ 'ชุด' ออกจาก exclude เพราะรายการที่เป็นชุดส่วนใหญ่คือรายการเหมา
      // และใช้ 'ราคาต่อ' เพื่อดักจับ 'ราคาต่อหน่วย' ได้ด้วย
      exclude: ['ต่อจุด', 'ต่อเมตร', 'ตร.ม.', 'ราคาต่อ']
    },

    // Electrical & Doors & Windows
    { description: "จำนวนห้องน้ำ (จุด)", keywords: ['บล็อกเครื่องทำน้ำอุ่น'], calculation: () => Math.ceil(bathrooms) },
    { description: "จำนวนห้องนอน + 1 (จุด)", keywords: ['บล็อกแอร์', 'โคมซาลาเปา'], calculation: () => Math.ceil(bedrooms + 1) },
    { description: "จำนวนห้องนอน * 4 (จุด)", keywords: ['ดาวไลท์', 'ดาวน์ไลท์'], calculation: () => Math.ceil(bedrooms * 4) },
    { description: "จำนวนห้องนอน (จุด)", keywords: ['ไฟกิ่งหน้าบ้าน', 'ไฟกิ่ง'], calculation: () => Math.ceil(bedrooms) },
    { description: "จำนวนห้องนอน * 6 (จุด)", keywords: ['บล็อกปลั๊ก', 'เต้ารับคู่', 'บล็อกสวิทช์', 'สวิทช์ทางเดียว', 'สวิตช์'], calculation: () => Math.ceil(bedrooms * 6) },
    { description: "จำนวนห้องน้ำ (บาน)", keywords: ['ประตูห้องน้ำ'], calculation: () => Math.ceil(bathrooms) },
    { description: "จำนวนห้องนอน (บาน)", keywords: ['ประตูภายใน'], calculation: () => Math.ceil(bedrooms) },
    { description: "จำนวนห้องน้ำ (บาน)", keywords: ['หน้าต่างบานกระทุ้ง'], calculation: () => Math.ceil(bathrooms) },
  ];

  // Add `usesVariable` flag to each rule
  return rules.map(rule => {
    const calcString = rule.calculation.toString();
    const usesVariable = varNames.some(v => new RegExp(`\\b${v}\\b`).test(calcString));
    return { ...rule, usesVariable };
  });
};

export const calculateAutoFillQty = (itemName, itemUnit, catId, projectInfo) => {
  // --- DEBUGGING: Log input for foundation-related items ---
  if (itemName) {
    const nameLowerForDebug = itemName.toString().toLowerCase();
    if (nameLowerForDebug.includes('เสาเข็ม') || nameLowerForDebug.includes('เสาตอม่อ')) {
      console.log(`[DEBUG] Checking: "${itemName}"`);
      console.log(`[DEBUG] projectInfo received:`, {
        foundationCount: projectInfo.foundationCount,
        pilesPerFoundation: projectInfo.pilesPerFoundation,
      });
    }
  }

  if (!itemName) return { value: null, matchedRule: null };
  const nameLower = itemName.toString().toLowerCase();

  // ถ้าชื่อรายการขึ้นต้นด้วย "เหล็กกล่อง" ให้เป็นการกรอกเอง (manual) เสมอ
  if (nameLower.startsWith('เหล็กกล่อง')) {
    return { value: null, matchedRule: { description: "Manual input for เหล็กกล่อง" } };
  }

  const unitLower = (itemUnit || '').toString().toLowerCase().replace(/\s+/g, '');
  const rules = getQtyRules(projectInfo);

  for (const rule of rules) {
    const nameMatch = rule.keywords.length === 0 || rule.keywords.some(kw => nameLower.includes(kw.toLowerCase()));
    const unitMatch = !rule.unitKeywords || rule.unitKeywords.some(kw => unitLower.includes(kw.toLowerCase()));
    const catMatch = !rule.catId || rule.catId === String(catId);
    const excludeMatch = !rule.exclude || !rule.exclude.some(kw => nameLower.includes(kw.toLowerCase()));

    if (nameMatch && unitMatch && catMatch && excludeMatch) {
      const value = rule.calculation();
      return { value, matchedRule: rule };
    }
  }

  return { value: null, matchedRule: null }; 
};

/**
 * Applies a bulk price adjustment to items within categories.
 * @param {Array} categories - The array of category objects.
 * @param {string} targetCatId - The ID of the category to adjust, or 'all'.
 * @param {number} percentage - The percentage to adjust prices by (e.g., 10 for 10%, -5 for -5%).
 * @param {string} priceTypes - Which prices to adjust: 'mat', 'labor', or 'both'.
 * @returns {Array} The new array of categories with adjusted prices.
 */
export const applyBulkPriceAdjustment = (categories, targetCatId, percentage, priceTypes) => {
  const factor = 1 + (percentage / 100);

  return categories.map(cat => {
    // Skip if it's not the target category (and not 'all')
    if (targetCatId !== 'all' && String(cat.id) !== String(targetCatId)) {
      return cat;
    }

    const newItems = cat.items.map(item => {
      const newItem = { ...item };
      const priceFields = [];
      if (['mat', 'both'].includes(priceTypes)) priceFields.push('matPrice');
      if (['labor', 'both'].includes(priceTypes)) priceFields.push('laborPrice');

      priceFields.forEach(field => {
        const oldPrice = parseFloat(newItem[field]);
        if (!isNaN(oldPrice) && oldPrice > 0) {
          newItem[field] = (oldPrice * factor).toFixed(2);
        }
      });
      
      return newItem;
    });

    return { ...cat, items: newItems };
  });
};
// ข้อมูลเริ่มต้นแบบเจาะลึก
export const initialCategories = [
  {
    id: 1, name: 'งานโครงสร้าง',
    items: [
      { id: '1.1', name: 'เสาเข็ม ไอ 0.15x0.15 ยาว12เมตร', qty: 14, unit: 'ต้น', matPrice: 1650, laborPrice: 1000 },
      { id: '1.2', name: 'ฐานรากแผ่ 1.00x1.00 ม.ลึก1.10', qty: 6, unit: 'ฐาน', matPrice: 650, laborPrice: 350 },
      { id: '1.3', name: 'งานคอนกรีต โครงสร้าง เสา คาน', qty: 1, unit: 'เหมา', matPrice: 152872, laborPrice: 15549 },
    ]
  },
  {
    id: 2, name: 'โครงสร้าง โครงหลังคา',
    items: [
      { id: '2.1', name: 'อะเส เหล็ก C 100x50x20x3.2 มม.', qty: 45, unit: 'ม.', matPrice: 250, laborPrice: 100 },
      { id: '2.2', name: 'จันทัน เหล็ก C 100x50x20x2.3 มม.', qty: 120, unit: 'ม.', matPrice: 180, laborPrice: 80 },
      { id: '2.3', name: 'แป เหล็ก C 75x45x15x2.3 มม.', qty: 250, unit: 'ม.', matPrice: 120, laborPrice: 50 }
    ]
  },
  {
    id: 3, name: 'งานมุงหลังคา',
    items: [
      { id: '3.1', name: 'กระเบื้องหลังคาซีแพคโมเนีย', qty: 150, unit: 'ตร.ม.', matPrice: 280, laborPrice: 150 },
      { id: '3.2', name: 'งานหลังคาเมทัลชีท', qty: 150, unit: 'ตร.ม.', matPrice: 180, laborPrice: 80 },
      { id: '3.3', name: 'ครอบสันหลังคาและอุปกรณ์', qty: 30, unit: 'ม.', matPrice: 350, laborPrice: 100 },
      { id: '3.4', name: 'แผ่นสะท้อนความร้อน', qty: 150, unit: 'ตร.ม.', matPrice: 50, laborPrice: 20 }
    ]
  },
  {
    id: 4, name: 'งานผนัง',
    items: [
      { id: '4.1', name: 'ผนังก่ออิฐมวลเบา(7.5 ซม.)', qty: 250, unit: 'ตร.ม.', matPrice: 280, laborPrice: 100 },
      { id: '4.2', name: 'ผนังก่ออิฐมอญ(7.5 ซม.)', qty: 50, unit: 'ตร.ม.', matPrice: 180, laborPrice: 120 },
      { id: '4.3', name: 'งานฉาบปูนเรียบผนังภายใน', qty: 300, unit: 'ตร.ม.', matPrice: 65, laborPrice: 80 },
      { id: '4.4', name: 'งานฉาบปูนเรียบผนังภายนอก', qty: 250, unit: 'ตร.ม.', matPrice: 65, laborPrice: 90 },
      { id: '4.5', name: 'งานกรุกระเบื้องผนังห้องน้ำ', qty: 45, unit: 'ตร.ม.', matPrice: 350, laborPrice: 250 },
      { id: '4.6', name: 'งานบัวผนัง', qty: 150, unit: 'ม.', matPrice: 120, laborPrice: 50 },
    ]
  },
  {
    id: 5, name: 'งานพื้น', 
    items: [
      { id: '5.1', name: 'งานเทพื้นคอนกรีตเสริมเหล็ก (Slab on ground)', qty: 120, unit: 'ตร.ม.', matPrice: 350, laborPrice: 150 },
      { id: '5.2', name: 'งานปูกระเบื้องแกรนิตโต้ 60x60 ซม. (รวมปูนทราย)', qty: 85, unit: 'ตร.ม.', matPrice: 450, laborPrice: 250 },
      { id: '5.3', name: 'งานปูกระเบื้องเซรามิค 30x30 ซม. (ห้องน้ำ, ซักล้าง)', qty: 35, unit: 'ตร.ม.', matPrice: 250, laborPrice: 200 },
      { id: '5.4', name: 'งานพื้นไม้ลามิเนต หนา 8 มม. พร้อมบัวพื้น', qty: 40, unit: 'ตร.ม.', matPrice: 550, laborPrice: 150 },
    ]
  },
  {
    id: 6, name: 'งานฝ้า', 
    items: [
      { id: '6.1', name: 'งานฝ้าเพดานยิปซั่มบอร์ด หนา 9 มม. ฉาบเรียบ โครงคร่าว C-Line', qty: 100, unit: 'ตร.ม.', matPrice: 250, laborPrice: 120 },
      { id: '6.2', name: 'งานฝ้าเพดานยิปซั่มบอร์ด ชนิดทนชื้น (ห้องน้ำ)', qty: 15, unit: 'ตร.ม.', matPrice: 280, laborPrice: 150 },
      { id: '6.3', name: 'งานฝ้าชายคา สมาร์ทบอร์ด เซาะร่อง มีรูระบายอากาศ', qty: 40, unit: 'ตร.ม.', matPrice: 320, laborPrice: 180 },
    ]
  },
  {
    id: 7, name: 'งานสี', 
    items: [
      { id: '7.1', name: 'งานทาสีน้ำพลาสติก ภายใน (รองพื้น 1 ทับหน้า 2)', qty: 300, unit: 'ตร.ม.', matPrice: 45, laborPrice: 35 },
      { id: '7.2', name: 'งานทาสีน้ำพลาสติก ภายนอก (รองพื้น 1 ทับหน้า 2)', qty: 250, unit: 'ตร.ม.', matPrice: 55, laborPrice: 45 },
      { id: '7.3', name: 'งานทาสีน้ำมัน (วงกบไม้, เหล็ก)', qty: 50, unit: 'ตร.ม.', matPrice: 60, laborPrice: 50 },
      { id: '7.4', name: 'งานทาสีฝ้าเพดาน', qty: 115, unit: 'ตร.ม.', matPrice: 40, laborPrice: 30 },
    ]
  },
  {
    id: 8, name: 'งานประตู+วงกบพร้อมชุดล็อค', 
    items: [
      { id: '8.1', name: 'ประตูบานเปิด UPVC ขนาด 0.80x2.00 ม. (ห้องน้ำ)', qty: 2, unit: 'ชุด', matPrice: 2500, laborPrice: 500 },
      { id: '8.2', name: 'ประตูบานเปิด ไม้สังเคราะห์ ขนาด 0.90x2.00 ม.', qty: 3, unit: 'ชุด', matPrice: 3500, laborPrice: 500 },
      { id: '8.3', name: 'ประตูบานเลื่อน อลูมิเนียมกระจกใส ขนาด 2.00x2.00 ม.', qty: 1, unit: 'ชุด', matPrice: 8500, laborPrice: 1500 },
    ]
  },
  {
    id: 9, name: 'งานหน้าต่าง+วงกบพร้อมชุดล็อค', 
    items: [
      { id: '9.1', name: 'หน้าต่างบานเลื่อน อลูมิเนียมกระจกใส ขนาด 1.20x1.10 ม.', qty: 4, unit: 'ชุด', matPrice: 3250, laborPrice: 500 },
      { id: '9.2', name: 'หน้าต่างบานกระทุ้ง อลูมิเนียมกระจกฝ้า ขนาด 0.60x0.40 ม.', qty: 2, unit: 'ชุด', matPrice: 1500, laborPrice: 300 },
    ]
  },
  {
    id: 10, name: 'งานไฟฟ้า', 
    items: [
      { id: '10.1', name: 'ตู้ควบคุมไฟฟ้า (Consumer Unit) 14 ช่อง พร้อมเมนและลูกย่อย', qty: 1, unit: 'ตู้', matPrice: 4500, laborPrice: 1500 },
      { id: '10.2', name: 'งานเดินสายไฟแสงสว่าง (จุด)', qty: 25, unit: 'จุด', matPrice: 450, laborPrice: 350 },
      { id: '10.3', name: 'งานเดินสายไฟเต้ารับ (จุด)', qty: 15, unit: 'จุด', matPrice: 550, laborPrice: 400 },
      { id: '10.4', name: 'โคมไฟดาวน์ไลท์ LED', qty: 20, unit: 'ชุด', matPrice: 250, laborPrice: 100 },
    ]
  },
  {
    id: 11, name: 'งานสุขภัณฑ์', 
    items: [
      { id: '11.1', name: 'ชักโครกแบบนั่งราบ (เกรดมาตรฐาน)', qty: 2, unit: 'ชุด', matPrice: 3500, laborPrice: 500 },
      { id: '11.2', name: 'อ่างล้างหน้า พร้อมก๊อกน้ำและอุปกรณ์', qty: 2, unit: 'ชุด', matPrice: 2500, laborPrice: 400 },
      { id: '11.3', name: 'สายชำระ', qty: 2, unit: 'ชุด', matPrice: 350, laborPrice: 100 },
      { id: '11.4', name: 'ฝักบัวอาบน้ำ', qty: 2, unit: 'ชุด', matPrice: 850, laborPrice: 150 },
    ]
  },
  {
    id: 12, name: 'งานระบบประปา', 
    items: [
      { id: '12.1', name: 'ท่อ PVC น้ำดี ชั้น 13.5 ขนาด 1/2" - 1"', qty: 50, unit: 'ม.', matPrice: 60, laborPrice: 40 },
      { id: '12.2', name: 'ท่อ PVC น้ำทิ้ง/โสโครก ชั้น 8.5 ขนาด 2" - 4"', qty: 30, unit: 'ม.', matPrice: 120, laborPrice: 80 },
      { id: '12.3', name: 'ถังบำบัดน้ำเสียสำเร็จรูป ขนาด 1000 ลิตร (สำหรับ 1-2 ห้องน้ำ)', qty: 0, unit: 'ถัง', matPrice: 6500, laborPrice: 2500 },
      { id: '12.4', name: 'ถังบำบัดน้ำเสียสำเร็จรูป ขนาด 1600 ลิตร (สำหรับ 3-4 ห้องน้ำ)', qty: 0, unit: 'ถัง', matPrice: 8500, laborPrice: 3000 },
    ]
  },
  {
    id: 13, name: 'งานเบ็ดเตล็ด', 
    items: [
      { id: '13.1', name: 'งานทำความสะอาดก่อนส่งมอบ', qty: 1, unit: 'งาน', matPrice: 0, laborPrice: 5000 },
      { id: '13.2', name: 'งานทดสอบระบบและอื่นๆ', qty: 1, unit: 'งาน', matPrice: 0, laborPrice: 3000 },
    ]
  },
];

export const variableGroups = [
    {
        title: 'ข้อมูลทั่วไป & พื้นที่',
        fields: [
            { key: 'area', label: 'พื้นที่ใช้สอยรวม (ตร.ม.)', tooltip: 'พื้นที่ใช้สอยทั้งหมดของอาคาร ไม่รวมพื้นที่จอดรถหรือระเบียงภายนอก' },
            { key: 'floors', label: 'ลักษณะบ้าน', tooltip: 'เช่น บ้านพักอาศัยชั้นเดียว, บ้านพักอาศัยสองชั้น, หอพัก' },
            { key: 'slabOnGroundArea', label: 'พื้นที่พื้น SOG (ตร.ม.)', tooltip: 'พื้นที่พื้นคอนกรีตวางบนดิน (Slab on Ground) สำหรับคำนวณเหล็กเสริมพื้น' },
            { key: 'slabOnGroundThickness', label: 'ความหนาพื้น SOG (ม.)', tooltip: 'ความหนาของพื้นคอนกรีตวางบนดิน (Slab on Ground) ค่าเริ่มต้น 0.10' },
            { key: 'slabConcreteStrength', label: 'กำลังคอนกรีตพื้น (ksc)', tooltip: 'กำลังอัดคอนกรีตสำหรับพื้น เช่น 240 ksc' },
            { key: 'bedrooms', label: 'จำนวนห้องนอน (ห้อง)', tooltip: 'จำนวนห้องนอนทั้งหมด ใช้สำหรับคำนวณงานไฟฟ้าและประตู' },
            { key: 'bathrooms', label: 'จำนวนห้องน้ำ (ห้อง)', tooltip: 'จำนวนห้องน้ำทั้งหมด ใช้สำหรับคำนวณงานสุขภัณฑ์และประตู' },
            { key: 'bedroomArea', label: 'พื้นที่ห้องนอนรวม (ตร.ม.)', tooltip: 'ผลรวมของพื้นที่ห้องนอนทุกห้อง ใช้สำหรับคำนวณพื้นลามิเนต' },
            { key: 'bathroomArea', label: 'พื้นที่ห้องน้ำรวม (ตร.ม.)', tooltip: 'ผลรวมของพื้นที่ห้องน้ำทุกห้อง ใช้สำหรับคำนวณฝ้าทนชื้นและกระเบื้อง' },
            { key: 'kitchenArea', label: 'พื้นที่ห้องครัว (ตร.ม.)', tooltip: 'พื้นที่ของห้องครัว ใช้สำหรับคำนวณกระเบื้องพื้น' },
        ]
    },
    {
        title: 'งานหลังคาและโครงสร้าง',
        fields: [
            { key: 'roofArea', label: 'พื้นที่หลังคา (ตร.ม.)', tooltip: 'พื้นที่หลังคาตามแนวลาดเอียง (Slope) ใช้คำนวณวัสดุมุงและโครงหลังคา' },
            { key: 'fasciaLength', label: 'ความยาวเชิงชาย (ม.)', tooltip: 'ความยาวรวมของไม้เชิงชายรอบหลังคา' },
            { key: 'aseLength', label: 'ความยาวอะเส (ม.)', tooltip: 'ความยาวรวมของอะเส, อกไก่, และดั้ง' },
            { key: 'rafterLength', label: 'ความยาวจันทัน (ม.)', tooltip: 'ความยาวรวมของจันทันทั้งหมด' },
            { key: 'purlinLength', label: 'ความยาวแป (ม.)', tooltip: 'ความยาวรวมของแปทั้งหมด' },
            { key: 'beamLength', label: 'ความยาวคานรวม (ม.)', tooltip: 'ความยาวรวมของคานทั้งหมดในอาคาร ใช้คำนวณเหล็กเสริม' },
            { key: 'avgBeamWidth', label: 'ความกว้างคานเฉลี่ย (ม.)', tooltip: 'เช่น 0.2' },
            { key: 'avgBeamHeight', label: 'ความสูงคานเฉลี่ย (ม.)', tooltip: 'เช่น 0.4' },
            { key: 'columnLength', label: 'ความยาวเสารวม (ม.)', tooltip: 'ความยาวรวมของเสาทุกต้นในอาคาร ใช้คำนวณเหล็กเสริม' },
            { key: 'avgColumnWidth', label: 'ความกว้างเสาเฉลี่ย (ม.)', tooltip: 'เช่น 0.2' },
            { key: 'avgColumnHeight', label: 'ความสูงเสาเฉลี่ย (ม.)', tooltip: 'เช่น 0.2' },
            { key: 'columnRebarCount', label: 'จำนวนเหล็กยืนในเสา (เส้น)', tooltip: 'จำนวนเหล็กยืนเฉลี่ยต่อเสา 1 ต้น ค่าเริ่มต้น 4' },
            { key: 'foundationCount', label: 'จำนวนฐานราก (หลุม)', tooltip: 'จำนวนฐานรากทั้งหมด ใช้คำนวณงานดินขุดและเสาเข็ม' },
            { key: 'pilesPerFoundation', label: 'จำนวนเสาเข็มต่อฐาน (ต้น)', tooltip: 'จำนวนเสาเข็มเฉลี่ยต่อ 1 ฐานราก (ถ้าไม่ระบุ จะใช้ค่า 1)' },
        ]
    },
    {
        title: 'งานผนังและอื่นๆ',
        fields: [
            { key: 'intWallArea', label: 'พื้นที่ผนังภายใน (ตร.ม.)', tooltip: 'พื้นที่ผนังภายในทั้งหมด (ด้านเดียว) สำหรับคำนวณสีทาภายใน' },
            { key: 'extWallArea', label: 'พื้นที่ผนังภายนอก (ตร.ม.)', tooltip: 'พื้นที่ผนังภายนอกทั้งหมด (ด้านเดียว) สำหรับคำนวณสีทาภายนอก' },
            { key: 'bathroomWallArea', label: 'พื้นที่ผนังห้องน้ำ (ตร.ม.)', tooltip: 'พื้นที่ผนังรวมสำหรับปูกระเบื้องในห้องน้ำ (ไม่ต้องหักลบประตูหน้าต่าง)' },
            { key: 'kitchenWallArea', label: 'พื้นที่ผนังห้องครัว (ตร.ม.)', tooltip: 'พื้นที่ผนังสำหรับปูกระเบื้องในห้องครัว (ไม่ต้องหักลบประตูหน้าต่าง)' },
            { key: 'plasterThickness', label: 'ความหนาปูนฉาบ (ม.)', tooltip: 'ความหนาของปูนฉาบผนัง ค่าเริ่มต้น 0.0125 ม. (1.25 ซม.)' },
            { key: 'totalWallVolume', label: 'ปริมาตรผนังรวม (ลบ.ม.)', tooltip: 'ปริมาตรผนังรวม (กว้างxยาวxหนา) ใช้คำนวณอิฐและปูนก่อ/ฉาบ (ถ้าไม่ระบุพื้นที่ผนัง)' },
            { key: 'perimeter', label: 'ความยาวเส้นรอบรูปอาคาร (ม.)', tooltip: 'ความยาวเส้นรอบนอกของตัวอาคารชั้นล่าง' },
            { key: 'parkingArea', label: 'พื้นที่จอดรถ (ตร.ม.)', tooltip: 'พื้นที่จอดรถ (ถ้ามี) สำหรับคำนวณงานพื้นบางประเภท' },
        ]
    }
];

export const emptyProjectInfo = {
  name: 'โครงการ',
  floors: 'บ้านพักอาศัยชั้นเดียว',
  owner: 'XXXX XXXX',
  location: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  slabOnGroundArea: '',
  slabOnGroundThickness: '0.10',
  slabConcreteStrength: '240',
  roofArea: '',
  bedroomArea: '',
  bathroomArea: '',
  prayerRoomArea: '', 
  hallArea: '',
  kitchenArea: '',
  balconyArea: '',
  washingArea: '', 
  perimeter: '', 
  foundationCount: '',
  pilesPerFoundation: '1',
  beamLength: '',
  avgBeamWidth: '0.20',
  avgBeamHeight: '0.40',
  columnLength: '',
  avgColumnWidth: '0.20',
  avgColumnHeight: '0.20',
  columnRebarCount: '4',
  aseLength: '',
  rafterLength: '',
  purlinLength: '',
  fasciaLength: '', 
  intWallArea: '', 
  extWallArea: '', 
  bathroomWallArea: '',
  kitchenWallArea: '',
  plasterThickness: '0.0125',
  totalWallVolume: '',
  parkingArea: '',
  estimator: '',
  projectNo: '',
  date: ''
};
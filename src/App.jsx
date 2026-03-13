import React, { useState, useEffect } from 'react';

// ฟังก์ชันแปลงตัวเลขเป็นตัวอักษรภาษาไทย
const THBText = (n) => {
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

// ข้อมูลเริ่มต้นแบบเจาะลึก
const initialCategories = [
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
      { id: '4.1', name: 'ผนังก่ออิฐมวลเบา 7.5 ซม. พร้อมเสาเอ็นทับหลัง', qty: 250, unit: 'ตร.ม.', matPrice: 280, laborPrice: 100 },
      { id: '4.2', name: 'ผนังก่ออิฐมอญครึ่งแผ่น พร้อมเสาเอ็นทับหลัง', qty: 50, unit: 'ตร.ม.', matPrice: 180, laborPrice: 120 },
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
      { id: '12.3', name: 'ถังบำบัดน้ำเสียสำเร็จรูป ขนาด 1000 ลิตร', qty: 1, unit: 'ถัง', matPrice: 6500, laborPrice: 2500 },
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

const initialProjectInfo = {
  name: 'โครงการก่อสร้าง',
  floors: 'บ้านพักอาศัยชั้นเดียว',
  owner: 'คุณสุธีร์ ชูยรัมย์',
  location: 'พานทอง ชลบุรี',
  bedrooms: 3,
  bathrooms: 2,
  area: 120,
  estimator: 'คิดเฮาส์.ดีซาย',
  projectNo: 'KHD-Axxx',
  date: '13 Mar 2026'
};

export default function App() {
  // ดึง State จาก Local Storage เพื่อทำ Auto-Save
  const [categories, setCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kid_bom_categories');
        return saved ? JSON.parse(saved) : initialCategories;
      } catch (e) {
        console.error("Error parsing categories from localStorage", e);
        return initialCategories;
      }
    }
    return initialCategories;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [profitMargin, setProfitMargin] = useState(0.05); // 5%
  
  const [discountRounding, setDiscountRounding] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kid_bom_discount');
        return saved ? JSON.parse(saved) : 0;
      } catch (e) {
        console.error("Error parsing discount from localStorage", e);
        return 0;
      }
    }
    return 0;
  });
  
  const [projectInfo, setProjectInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kid_bom_project_info');
        return saved ? JSON.parse(saved) : { ...initialProjectInfo };
      } catch (e) {
        console.error("Error parsing project info from localStorage", e);
        return { ...initialProjectInfo };
      }
    }
    return { ...initialProjectInfo };
  });

  const [masterBom, setMasterBom] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kid_bom_master');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Error parsing master BOM from localStorage", e);
        return [];
      }
    }
    return [];
  });

  // Effect สำหรับ Auto-save
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kid_bom_categories', JSON.stringify(categories));
      localStorage.setItem('kid_bom_project_info', JSON.stringify(projectInfo));
      localStorage.setItem('kid_bom_discount', JSON.stringify(discountRounding));
      localStorage.setItem('kid_bom_master', JSON.stringify(masterBom));
    }
  }, [categories, projectInfo, discountRounding, masterBom]);

  const handleProjectInfoChange = (field, value) => {
    setProjectInfo(prev => ({ ...prev, [field]: value }));
  };

  // --- ระบบ Download / Upload Project (JSON) ---
  const exportProjectToJSON = () => {
    const projectData = {
      version: '1.0',
      projectInfo,
      categories,
      discountRounding,
      masterBom,
      lastModified: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `BOQ_${projectInfo.name || 'Project'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importProjectFromJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.projectInfo) setProjectInfo(data.projectInfo);
        if (data.categories) setCategories(data.categories);
        if (data.discountRounding !== undefined) setDiscountRounding(data.discountRounding);
        if (data.masterBom) setMasterBom(data.masterBom);
        alert('โหลดโปรเจกต์สำเร็จ!');
      } catch (err) {
        alert('ไฟล์โปรเจกต์ไม่ถูกต้อง หรืออาจเสียหาย');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const resetProject = () => {
    if (window.confirm('คุณต้องการรีเซ็ตโปรเจกต์และเริ่มใหม่ทั้งหมดหรือไม่? (ข้อมูลเดิมจะหายไป)')) {
      setCategories(initialCategories);
      setProjectInfo({ ...initialProjectInfo });
      setDiscountRounding(0);
    }
  };

  const clearMasterBom = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลฐาน BOM ทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      setMasterBom([]);
    }
  };

  // --- ระบบ Export Master BOM เป็น CSV ---
  const exportMasterBomToCSV = () => {
    if (masterBom.length === 0) {
      alert('ไม่มีข้อมูลสำหรับนำออก');
      return;
    }
    
    // สร้าง Header ของ CSV ให้ตรงกับ Format ที่อ่านเข้า
    let csvContent = "หมวดงาน,รายการวัสดุ,หน่วย,ค่าวัสดุ/หน่วย,ค่าแรง/หน่วย\n";
    
    // วนลูปข้อมูลในตาราง
    masterBom.forEach(item => {
      const catId = item.catId || '';
      // ใส่ Double Quotes ครอบชื่อรายการ เผื่อมีลูกน้ำ (,) ด้านในข้อความ
      const name = `"${(item.name || '').replace(/"/g, '""')}"`;
      const unit = `"${(item.unit || '').replace(/"/g, '""')}"`;
      const matPrice = item.matPrice || 0;
      const laborPrice = item.laborPrice || 0;
      
      csvContent += `${catId},${name},${unit},${matPrice},${laborPrice}\n`;
    });

    // ใช้ BOM (\ufeff) เพื่อบังคับให้ Excel อ่านเป็น UTF-8 (แก้ภาษาไทยต่างดาว)
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'DATA_BOM_EXPORT.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
          const text = evt.target.result;
          const rows = text.split(/\r?\n/);
          if (rows.length < 2) return; 
          
          const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          
          const catIdx = headers.findIndex(h => h.includes('หมวด') || h.includes('ลำดับ'));
          const nameIdx = headers.findIndex(h => h.includes('รายการ') || h.includes('วัสดุ') || h.includes('ชื่อ'));
          let unitIdx = headers.findIndex(h => h === 'หน่วย');
          if (unitIdx === -1) unitIdx = headers.findIndex(h => h.includes('หน่วย') && !h.includes('ค่า') && !h.includes('ราคา'));
          const matIdx = headers.findIndex(h => h.includes('ค่าวัสดุ') || h.includes('ราคาของ') || (h.includes('ราคา') && !h.includes('แรง')));
          const laborIdx = headers.findIndex(h => h.includes('ค่าแรง') || h.includes('แรงงาน'));

          const newBom = [];
          for (let idx = 1; idx < rows.length; idx++) {
            const row = rows[idx];
            if (!row.trim()) continue;
            
            let cols = [];
            let inQuote = false;
            let currentVal = '';
            for(let i=0; i<row.length; i++) {
                let char = row[i];
                if(char === '"') inQuote = !inQuote;
                else if(char === ',' && !inQuote) { cols.push(currentVal); currentVal = ''; }
                else currentVal += char;
            }
            cols.push(currentVal);
            cols = cols.map(c => c.trim().replace(/^"|"$/g, ''));

            let catId = '', name = '', unit = '', matPrice = 0, laborPrice = 0;

            if (catIdx === -1 && nameIdx === -1) {
                if (cols.length >= 5) {
                    catId = cols[0]; name = cols[1]; unit = cols[2];
                    matPrice = parseFloat(cols[3]) || 0; laborPrice = parseFloat(cols[4]) || 0;
                } else {
                    name = cols[0]; unit = cols[1];
                    matPrice = parseFloat(cols[2]) || 0; laborPrice = parseFloat(cols[3]) || 0;
                }
            } else {
                catId = catIdx >= 0 ? cols[catIdx] : '';
                name = nameIdx >= 0 ? cols[nameIdx] : '';
                unit = unitIdx >= 0 ? cols[unitIdx] : '';
                matPrice = parseFloat(matIdx >= 0 ? cols[matIdx] : 0) || 0;
                laborPrice = parseFloat(laborIdx >= 0 ? cols[laborIdx] : 0) || 0;
            }

            if (name) { 
              newBom.push({
                id: `bom_${Date.now()}_${idx}`,
                catId: catId,
                name: name,
                unit: unit,
                matPrice: matPrice,
                laborPrice: laborPrice
              });
            }
          }
          setMasterBom(prev => [...prev, ...newBom]);
      } catch (err) {
         alert('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV กรุณาตรวจสอบรูปแบบไฟล์');
         console.error(err);
      } finally {
         e.target.value = '';
      }
    };
    reader.readAsText(file, 'windows-874'); 
  };

  const handleMasterBomChange = (id, field, value) => {
    setMasterBom(masterBom.map(item => {
      if (item.id !== id) return item;
      const val = ['name', 'unit', 'catId'].includes(field) ? value : (value === '' ? '' : parseFloat(value) || 0);
      return { ...item, [field]: val };
    }));
  };

  const addMasterBom = () => {
    setMasterBom([...masterBom, { id: `bom_${Date.now()}`, catId: '', name: 'รายการใหม่', unit: 'หน่วย', matPrice: 0, laborPrice: 0 }]);
  };

  const removeMasterBom = (id) => {
    setMasterBom(masterBom.filter(item => item.id !== id));
  };

  const applyBomToItem = (catId, itemId, bomId) => {
    if (!bomId) return;
    const bom = masterBom.find(b => b.id === bomId);
    if (!bom) return;
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, name: bom.name, unit: bom.unit, matPrice: bom.matPrice, laborPrice: bom.laborPrice };
        })
      };
    }));
  };

  const formatNum = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePrint = () => {
    window.print();
  };

  const handleItemChange = (catId, itemId, field, value) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          const val = ['name', 'unit'].includes(field) ? value : (value === '' ? '' : parseFloat(value) || 0);
          return { ...item, [field]: val };
        })
      };
    }));
  };

  const handleAddItem = (catId) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      const newItemId = `${catId}.${cat.items.length + 1}`;
      return {
        ...cat,
        items: [...cat.items, { id: newItemId, name: 'รายการใหม่', qty: 1, unit: 'หน่วย', matPrice: 0, laborPrice: 0 }]
      };
    }));
  };

  const handleRemoveItem = (catId, itemId) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, items: cat.items.filter(item => item.id !== itemId) };
    }));
  };

  const getCategoryTotals = (cat) => {
    const material = cat.items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.matPrice) || 0)), 0);
    const labor = cat.items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.laborPrice) || 0)), 0);
    return { material, labor, total: material + labor };
  };

  let grandTotalMaterial = 0;
  let grandTotalLabor = 0;

  const summaryRows = categories.map(cat => {
    const totals = getCategoryTotals(cat);
    grandTotalMaterial += totals.material;
    grandTotalLabor += totals.labor;
    return { id: cat.id, name: cat.name, ...totals };
  });

  const subTotal = grandTotalMaterial + grandTotalLabor;
  const overheadProfit = subTotal * profitMargin;
  const totalWithProfit = subTotal + overheadProfit;
  const grandTotal = totalWithProfit - discountRounding;

  const costPerSqm = projectInfo.area > 0 ? (grandTotal / projectInfo.area) : 0;
  const matPercent = subTotal > 0 ? (grandTotalMaterial / subTotal) * 100 : 0;
  const laborPercent = subTotal > 0 ? (grandTotalLabor / subTotal) * 100 : 0;
  
  const sortedCategories = [...summaryRows].sort((a, b) => b.total - a.total);
  const maxCategoryTotal = sortedCategories[0]?.total || 1;

  const groupedMasterBom = masterBom.reduce((acc, item) => {
    const cat = item.catId ? item.catId.toString().trim() : '';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // คอมโพเนนต์ Header โทนคลาสสิค + ฟอนต์ Supermarket พร้อมเลขหน้าและวันที่
  const DocumentHeader = ({ title, pageIndex, totalPages }) => {
    // สร้างวันที่และเวลาปัจจุบัน สำหรับพิมพ์กำกับมุมขวาบน
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="bg-white font-smk relative z-10 border-b-2 border-blue-custom print:border-b-2">
        {/* ข้อความแสดงเฉพาะตอน Print มุมขวาบนสุด (ทดแทน Header ของบราวเซอร์) */}
        <div className="hidden print:block absolute -top-4 right-0 text-right text-[10px] text-gray-500 font-bold">
          วันที่พิมพ์: {dateStr} เวลา {timeStr} น. &nbsp;&nbsp;|&nbsp;&nbsp; แผ่นที่ {pageIndex} / {totalPages}
        </div>

        <div className="grid grid-cols-12 gap-2 p-3 text-[12px] leading-tight">
          <div className="col-span-6 grid grid-cols-[70px_1fr] gap-y-1">
            <div className="font-bold text-gray-700">PROJECT :</div>
            <div className="font-bold text-gray-900">{projectInfo.name} {projectInfo.floors}</div>
            <div className="font-bold text-gray-700">OWNER :</div>
            <div className="font-bold text-gray-900">{projectInfo.owner}</div>
            <div className="font-bold text-gray-700">LOCATION :</div>
            <div className="font-bold text-gray-900">{projectInfo.location}</div>
            <div className="font-bold text-gray-700">SUBJECT :</div>
            <div className="font-bold text-gray-900">{projectInfo.bedrooms} ห้องนอน {projectInfo.bathrooms} ห้องน้ำ ({projectInfo.area} ตร.ม.)</div>
          </div>
          
          <div className="col-span-3 grid grid-cols-[85px_1fr] gap-y-1">
            <div className="font-bold text-gray-700">Doc No :</div>
            <div className="font-bold text-gray-900"></div>
            <div className="font-bold text-gray-700">Doc. Title :</div>
            <div className="font-bold text-gray-900">{title}</div>
            <div className="font-bold text-gray-700">ESTIMATED BY :</div>
            <div className="font-bold text-gray-900">{projectInfo.estimator}</div>
          </div>

          <div className="col-span-3 grid grid-cols-[70px_1fr] gap-y-1">
            <div className="font-bold text-gray-700 text-left">Project No :</div>
            <div className="font-bold text-gray-900 text-left">{projectInfo.projectNo}</div>
            <div className="font-bold text-gray-700 text-left">Date :</div>
            <div className="font-bold text-gray-900 text-left">{projectInfo.date}</div>
            <div className="font-bold text-gray-700 text-left">Revision :</div>
            <div className="font-bold text-gray-900 text-left"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-200 pb-12 font-sans text-gray-800 print:py-0 print:bg-white print:pb-0 font-smk">
      <style>{`
        /* นำเข้าฟอนต์ Supermarket และ ฟอนต์สำรอง */
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;700&display=swap');
        @font-face {
          font-family: 'Supermarket';
          src: local('Supermarket');
        }
        
        .font-smk {
          font-family: 'Supermarket', 'Sarabun', sans-serif !important;
        }

        /* โทนสีน้ำเงินคลาสสิค */
        .border-blue-custom { border-color: #0055ff !important; }
        .bg-blue-light { background-color: #99ccff !important; color: #000 !important; }
        
        @media print {
          @page { size: A4; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
          .no-print { display: none !important; }
          
          /* ------ แก้ไขระบบ Print: จัดการหน้ากระดาษ ให้ต่อกันสมบูรณ์ ------ */
          .print-show { display: flex !important; }
          .page-break { 
              page-break-before: always !important; 
              break-before: page !important; 
          }
          .a4-container { 
              display: block !important;       /* บังคับเป็น Block แทน Flex ป้องกันแผ่นขาด */
              min-height: 0 !important;        /* ลบความสูงบังคับออก ให้เนื้อหาไหลไปหน้าใหม่ตามจริง */
              height: auto !important; 
              box-shadow: none !important; 
              border-radius: 0 !important; 
              border-color: #0055ff !important; 
              border-width: 1px !important;
              margin-left: auto !important;
              margin-right: auto !important;
              margin-bottom: 10mm !important;  /* เพิ่มระยะห่างระหว่างชุดหมวดงาน */
          }
          /* -------------------------------------------------------- */
        }
        
        /* ซ่อน Scrollbar */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        /* สไตล์ Input กระชับในตาราง */
        .clean-input {
          width: 100%;
          background: transparent;
          outline: none;
          border: 1px solid transparent;
          padding: 0px 2px;
          transition: all 0.1s ease;
          font-family: inherit;
        }
        .clean-input:hover { background-color: #f8fafc; border-color: #cbd5e1; }
        .clean-input:focus { background-color: white; border-color: #818cf8; box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.2); }
      `}</style>

      {/* เมนูนำทาง (Nav Bar) */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-300 shadow-md mb-6 no-print px-4 py-2 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[300px] flex items-center gap-3">
          <div className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-lg shadow">
            K
          </div>
          <div className="flex gap-1">
             <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-[13px] rounded font-bold transition-all ${activeTab === 'dashboard' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
            >
              📊 ข้อมูลโครงการ
            </button>
            <button 
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 text-[13px] rounded font-bold transition-all ${activeTab === 'summary' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
            >
              📄 หน้าสรุป
            </button>
            
            <select 
              className={`px-2 py-1.5 text-[13px] rounded font-bold outline-none cursor-pointer transition-all ${typeof activeTab === 'number' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent'}`}
              value={typeof activeTab === 'number' ? activeTab : ''}
              onChange={(e) => setActiveTab(e.target.value ? Number(e.target.value) : 'summary')}
            >
              <option value="" disabled>📁 เลือกหมวดงานก่อสร้าง...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.id}. {cat.name}</option>
              ))}
            </select>

            <button 
              onClick={() => setActiveTab('bom')}
              className={`px-3 py-1.5 text-[13px] rounded font-bold flex items-center gap-1 transition-all ${activeTab === 'bom' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
            >
              ⚙️ จัดการ BOM
            </button>
          </div>
        </div>
        <button onClick={handlePrint} className="bg-gray-800 hover:bg-black text-white font-bold py-1.5 px-4 rounded shadow-md flex items-center gap-2 transition-all text-sm">
          🖨️ พิมพ์ / PDF
        </button>
      </div>

      {/* สั่ง print:block ไว้ที่ตัวครอบสุด เพื่อให้ไหลไปได้หลายๆ หน้า */}
      <div className="flex flex-col items-center gap-10 print:block">

        {/* =========================================
            หน้า 0.1: DASHBOARD
        ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="w-[210mm] bg-white rounded shadow-xl border border-gray-300 p-6 text-gray-800 no-print print:hidden font-smk mx-auto">
            <div className="mb-4 pb-2 border-b border-gray-200 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Overview</h1>
                <p className="text-gray-500 text-sm">บทวิเคราะห์และตั้งค่าข้อมูลโครงการก่อสร้าง</p>
              </div>
              <div className="flex gap-2">
                <button onClick={resetProject} className="text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded shadow-sm transition-colors">
                  🔄 เริ่มโปรเจกต์ใหม่
                </button>
                <label className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded shadow-sm transition-colors cursor-pointer flex items-center gap-1">
                  📂 เปิดโปรเจกต์
                  <input type="file" accept=".json" className="hidden" onChange={importProjectFromJSON} />
                </label>
                <button onClick={exportProjectToJSON} className="text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm transition-colors">
                  💾 บันทึกโปรเจกต์ (JSON)
                </button>
              </div>
            </div>

            {/* แถบกรอกข้อมูลโครงการ (Project Details Form) */}
            <div className="bg-gray-50 rounded p-4 border border-gray-200 mb-6">
              <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                📋 ข้อมูลโครงการ (Project Information)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">ชื่อโครงการ (Project)</label>
                  <input type="text" value={projectInfo.name} onChange={e => handleProjectInfoChange('name', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">ลักษณะบ้าน (จำนวนชั้น)</label>
                  <select 
                    value={projectInfo.floors} 
                    onChange={e => handleProjectInfoChange('floors', e.target.value)} 
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold transition-colors cursor-pointer"
                  >
                    <option value="บ้านพักอาศัยชั้นเดียว">บ้านพักอาศัยชั้นเดียว</option>
                    <option value="บ้านพักอาศัยชั้นครึ่ง">บ้านพักอาศัยชั้นครึ่ง</option>
                    <option value="บ้านพักอาศัยสองชั้น">บ้านพักอาศัยสองชั้น</option>
                    <option value="บ้านน็อคดาวน์">บ้านน็อคดาวน์</option>
                    <option value="อาคารหอพัก">อาคารหอพัก</option>
                    <option value="อพาร์ทเม้นท์">อพาร์ทเม้นท์</option>
                    <option value="ต่อเติม">ต่อเติม</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">เจ้าของโครงการ (Owner)</label>
                  <input type="text" value={projectInfo.owner} onChange={e => handleProjectInfoChange('owner', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">สถานที่ก่อสร้าง (Location)</label>
                  <input type="text" value={projectInfo.location} onChange={e => handleProjectInfoChange('location', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold transition-colors" />
                </div>
                
                <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ห้องนอน</label>
                      <input type="number" value={projectInfo.bedrooms} onChange={e => handleProjectInfoChange('bedrooms', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold text-center transition-colors" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ห้องน้ำ</label>
                      <input type="number" value={projectInfo.bathrooms} onChange={e => handleProjectInfoChange('bathrooms', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold text-center transition-colors" />
                    </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">พื้นที่ใช้สอย (ตร.ม.)</label>
                  <input type="number" value={projectInfo.area} onChange={e => handleProjectInfoChange('area', Number(e.target.value))} className="w-full bg-white border-2 border-orange-300 rounded px-2 py-1 outline-none focus:border-orange-500 text-sm font-extrabold text-orange-700 text-right transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">ผู้ประเมินราคา (ESTIMATED BY)</label>
                  <input type="text" value={projectInfo.estimator} onChange={e => handleProjectInfoChange('estimator', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold transition-colors" />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">รหัสโครงการ</label>
                      <input type="text" value={projectInfo.projectNo} onChange={e => handleProjectInfoChange('projectNo', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold transition-colors" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">วันที่ (Date)</label>
                      <input type="text" value={projectInfo.date} onChange={e => handleProjectInfoChange('date', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-sm font-bold transition-colors" />
                    </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded p-4 border border-blue-200">
                <p className="text-[11px] font-bold text-blue-700 mb-1">งบประมาณรวมทั้งสิ้น</p>
                <h2 className="text-2xl font-extrabold text-blue-900">{formatNum(grandTotal)} <span className="text-sm font-medium">THB</span></h2>
              </div>
              <div className="bg-orange-50 rounded p-4 border border-orange-200">
                <p className="text-[11px] font-bold text-orange-700 mb-1">ราคาประเมินต่อ ตร.ม.</p>
                <h2 className="text-2xl font-extrabold text-orange-900">{formatNum(costPerSqm)} <span className="text-sm font-medium">/ ตร.ม.</span></h2>
              </div>
              <div className="bg-green-50 rounded p-4 border border-green-200">
                <p className="text-[11px] font-bold text-green-700 mb-1">กำไรดำเนินการ ({profitMargin * 100}%)</p>
                <h2 className="text-2xl font-extrabold text-green-900">{formatNum(overheadProfit)} <span className="text-sm font-medium">THB</span></h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-5 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">สัดส่วน วัสดุ vs แรงงาน</h3>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <div className="text-blue-600">วัสดุ {matPercent.toFixed(1)}%</div>
                  <div className="text-teal-600">แรงงาน {laborPercent.toFixed(1)}%</div>
                </div>
                <div className="w-full h-4 flex rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                  <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${matPercent}%` }}></div>
                  <div className="h-full bg-teal-500 transition-all duration-700" style={{ width: `${laborPercent}%` }}></div>
                </div>
                <div className="mt-4 flex gap-4 text-[11px]">
                  <div>
                    <p className="text-gray-500 font-bold mb-0.5">ยอดรวมวัสดุ</p>
                    <p className="font-extrabold text-gray-800">{formatNum(grandTotalMaterial)} ฿</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-bold mb-0.5">ยอดรวมแรงงาน</p>
                    <p className="font-extrabold text-gray-800">{formatNum(grandTotalLabor)} ฿</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded p-5 border border-gray-200 h-[240px] overflow-y-auto no-scrollbar">
                <h3 className="text-sm font-bold text-gray-800 mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
                   หมวดงานที่ใช้งบสูงสุด
                </h3>
                <div className="flex flex-col gap-3">
                  {sortedCategories.slice(0, 6).map((cat, index) => {
                    const percentOfTotal = (cat.total / subTotal) * 100;
                    const relativeWidth = (cat.total / maxCategoryTotal) * 100;
                    return (
                      <div key={cat.id} className="flex flex-col">
                        <div className="flex justify-between text-[11px] font-bold text-gray-700 mb-1">
                          <span className="truncate pr-2">{index + 1}. {cat.name} ({percentOfTotal.toFixed(1)}%)</span>
                          <span className="font-extrabold text-gray-900 shrink-0">{formatNum(cat.total)}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-gray-400'}`}
                            style={{ width: `${relativeWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            หน้า 0.2: ฐานข้อมูล BOM 
        ========================================== */}
        {activeTab === 'bom' && (
          <div className="w-[210mm] min-h-[297mm] bg-white border border-gray-300 shadow-xl p-6 text-[13px] flex flex-col no-print print:hidden font-smk mx-auto">
            <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Master BOM Database</h2>
                <p className="text-gray-600 text-[11px] mt-0.5 font-bold">จัดการฐานข้อมูลราคาวัสดุและแรงงาน (อิงตามไฟล์ DATA BOM.csv)</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={addMasterBom} className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors text-xs shadow-sm font-bold flex items-center gap-1">
                  ➕ เพิ่มรายการ
                </button>
                <button onClick={exportMasterBomToCSV} className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 px-3 py-1.5 rounded transition-colors text-xs shadow-sm font-bold flex items-center gap-1">
                  📥 นำออก CSV
                </button>
                <label className="bg-green-600 hover:bg-green-700 text-white border border-green-700 px-3 py-1.5 rounded cursor-pointer font-bold shadow-sm transition-colors flex items-center gap-1 text-xs">
                  📁 นำเข้า CSV
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
                <button onClick={clearMasterBom} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded transition-colors text-xs shadow-sm font-bold flex items-center gap-1">
                  🗑️ ล้างข้อมูล
                </button>
              </div>
            </div>

            <div className="bg-white">
              <table className="w-full text-left border-collapse border border-blue-custom">
                <thead>
                  <tr className="bg-blue-light text-center">
                    <th className="p-1 border border-blue-custom text-[12px] font-bold w-[5%]">ลบ</th>
                    <th className="p-1 border border-blue-custom text-[12px] font-bold w-[8%] text-center">หมวด</th>
                    <th className="p-1 border border-blue-custom text-[12px] font-bold w-[37%] text-left px-2">รายการวัสดุ / ค่าแรง</th>
                    <th className="p-1 border border-blue-custom text-[12px] font-bold w-[10%]">หน่วย</th>
                    <th className="p-1 border border-blue-custom text-[12px] font-bold w-[20%] text-right pr-2">ค่าวัสดุ/หน่วย</th>
                    <th className="p-1 border border-blue-custom text-[12px] font-bold w-[20%] text-right pr-2">ค่าแรง/หน่วย</th>
                  </tr>
                </thead>
                <tbody>
                  {masterBom.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-500 border border-blue-custom bg-gray-50 font-bold">
                        ยังไม่มีข้อมูล BOM ในระบบ กรุณาอัปโหลดไฟล์ CSV
                      </td>
                    </tr>
                  )}
                  {Object.keys(groupedMasterBom).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})).map(catKey => (
                    <React.Fragment key={catKey}>
                      <tr className="bg-gray-100 border-y-2 border-blue-custom">
                        <td colSpan="6" className="p-1.5 px-3 text-left font-extrabold text-blue-800 text-[13px]">
                          {catKey === '' ? '▶ รายการที่ไม่ได้ระบุหมวดหมู่' : `▶ หมวดงานที่ ${catKey}`}
                        </td>
                      </tr>
                      {groupedMasterBom[catKey].map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="p-1 text-center border border-blue-custom">
                            <button onClick={() => removeMasterBom(item.id)} className="text-red-500 hover:text-red-700 font-bold px-1 rounded hover:bg-red-100" title="ลบรายการ">✕</button>
                          </td>
                          <td className="p-1 border border-blue-custom">
                            <input type="text" value={item.catId} onChange={(e) => handleMasterBomChange(item.id, 'catId', e.target.value)} className="clean-input text-center font-bold text-gray-800" placeholder="-" title="เลขหมวดงาน" />
                          </td>
                          <td className="p-1 border border-blue-custom">
                            <input type="text" value={item.name} onChange={(e) => handleMasterBomChange(item.id, 'name', e.target.value)} className="clean-input font-bold text-gray-800" placeholder="ชื่อรายการ..." />
                          </td>
                          <td className="p-1 border border-blue-custom">
                            <input type="text" value={item.unit} onChange={(e) => handleMasterBomChange(item.id, 'unit', e.target.value)} className="clean-input text-center font-bold text-gray-700" />
                          </td>
                          <td className="p-1 border border-blue-custom">
                            <input type="number" value={item.matPrice} onChange={(e) => handleMasterBomChange(item.id, 'matPrice', e.target.value)} className="clean-input text-right text-blue-700 font-bold" />
                          </td>
                          <td className="p-1 border border-blue-custom">
                            <input type="number" value={item.laborPrice} onChange={(e) => handleMasterBomChange(item.id, 'laborPrice', e.target.value)} className="clean-input text-right text-teal-700 font-bold" />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-end items-center">
               <span className="text-gray-500 font-bold text-[11px] flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></span>
                 บันทึกอัตโนมัติ ({masterBom.length} รายการ)
               </span>
            </div>
          </div>
        )}

        {/* =========================================
            หน้า 1: หน้าสรุป (SUMMARY)
        ========================================== */}
        {/* เปลี่ยน print:flex เป็น print:block เพื่อป้องกันบั๊ก Chrome พริ้นท์หน้าเดียว */}
        <div className={`a4-container w-[210mm] bg-white border border-blue-custom shadow-xl relative text-[13px] mx-auto ${activeTab === 'summary' ? 'flex flex-col' : 'hidden print:block'}`}>
          <DocumentHeader title="SUMMARY BOQ" pageIndex={1} totalPages={categories.length + 1} />

          <div className="flex-grow p-4">
            <table className="w-full text-left border-collapse border border-blue-custom">
              <thead>
                <tr className="bg-blue-light">
                  <th className="p-1.5 border border-blue-custom text-[13px] font-extrabold text-black text-center w-[8%]">ลำดับที่</th>
                  <th className="p-1.5 border border-blue-custom text-[13px] font-extrabold text-black w-[35%] px-2">รายละเอียด</th>
                  <th className="p-1.5 border border-blue-custom text-[13px] font-extrabold text-black text-right w-[19%] pr-2">ค่าวัสดุ</th>
                  <th className="p-1.5 border border-blue-custom text-[13px] font-extrabold text-black text-right w-[19%] pr-2">ค่าแรง</th>
                  <th className="p-1.5 border border-blue-custom text-[13px] font-extrabold text-black text-right w-[19%] pr-2">รวมเงิน</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.id} className="group hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => setActiveTab(row.id)}>
                    <td className="p-1.5 text-center border border-blue-custom font-bold text-gray-700">{row.id}</td>
                    <td className="p-1.5 px-2 border border-blue-custom font-bold text-gray-900 group-hover:text-blue-700">{row.name}</td>
                    <td className="p-1.5 pr-2 text-right border border-blue-custom font-bold text-gray-700">{formatNum(row.material)}</td>
                    <td className="p-1.5 pr-2 text-right border border-blue-custom font-bold text-gray-700">{formatNum(row.labor)}</td>
                    <td className="p-1.5 pr-2 text-right border border-blue-custom font-extrabold text-black">{formatNum(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end">
              <table className="w-2/3 text-left border-collapse border border-blue-custom">
                <tbody>
                  <tr>
                    <td className="p-1.5 px-2 border border-blue-custom font-bold text-gray-800 w-[60%]">รวมราคาวัสดุ</td>
                    <td className="p-1.5 pr-2 border border-blue-custom font-extrabold text-right text-black w-[40%]">{formatNum(grandTotalMaterial)}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 px-2 border border-blue-custom font-bold text-gray-800">รวมราคาค่าแรง</td>
                    <td className="p-1.5 pr-2 border border-blue-custom font-extrabold text-right text-black">{formatNum(grandTotalLabor)}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="p-1.5 px-2 border border-blue-custom font-extrabold text-black">รวมราคาค่าก่อสร้าง (Sub Total)</td>
                    <td className="p-1.5 pr-2 border border-blue-custom font-extrabold text-right text-black">{formatNum(subTotal)}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 px-2 border border-blue-custom font-bold text-gray-800">Overheads & Profit ({profitMargin * 100}%)</td>
                    <td className="p-1.5 pr-2 border border-blue-custom font-extrabold text-right text-black">{formatNum(overheadProfit)}</td>
                  </tr>
                  <tr className="bg-blue-light border-2 border-blue-custom">
                    <td className="p-2 px-2 border border-blue-custom font-extrabold text-black flex justify-between items-center">
                      <span className="text-[14px]">ยอดสุทธิ (Grand Total)</span>
                      <span className="text-[10px] text-gray-700 font-normal no-print flex items-center gap-1">
                        ปัดเศษ: <input type="number" value={discountRounding} onChange={e => setDiscountRounding(Number(e.target.value))} className="w-14 border border-gray-400 rounded px-1 text-right bg-white outline-none" />
                      </span>
                    </td>
                    <td className="p-2 pr-2 border border-blue-custom font-extrabold text-right text-black text-[15px]">{formatNum(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-center text-sm font-extrabold text-black bg-blue-light py-1.5 border border-blue-custom">
              ( {THBText(grandTotal)} )
            </div>
          </div>
        </div>

        {/* =========================================
            หน้า 2-N: หน้ารายละเอียด (BREAKDOWN)
        ========================================== */}
        {categories.map((cat, index) => {
          const isVisible = activeTab === cat.id;
          const totals = getCategoryTotals(cat);
          
          return (
            <div 
              key={cat.id} 
              className={`a4-container w-[210mm] bg-white border border-blue-custom shadow-xl relative text-[12px] mx-auto page-break ${isVisible ? 'flex flex-col' : 'hidden'} print:block`}
            >
              <DocumentHeader title={`หมวดที่ ${cat.id} - ${cat.name}`} pageIndex={index + 2} totalPages={categories.length + 1} />

              <div className="flex-grow p-4">
                <table className="w-full text-left border-collapse table-fixed border border-blue-custom">
                  <thead>
                    <tr className="bg-blue-light text-center">
                      <th rowSpan="2" className="p-1 border border-blue-custom text-[12px] font-bold text-black w-[5%]">No.</th>
                      <th rowSpan="2" className="p-1 border border-blue-custom text-[12px] font-bold text-black w-[45%]">รายการ</th>
                      <th rowSpan="2" className="p-1 border border-blue-custom text-[12px] font-bold text-black w-[7%]">จำนวน</th>
                      <th rowSpan="2" className="p-1 border border-blue-custom text-[12px] font-bold text-black w-[7%]">หน่วย</th>
                      <th colSpan="2" className="p-1 border border-blue-custom text-[12px] font-bold text-black w-[18%]">ค่าวัสดุ</th>
                      <th colSpan="2" className="p-1 border border-blue-custom text-[12px] font-bold text-black w-[18%]">ค่าแรงงาน</th>
                    </tr>
                    <tr className="bg-blue-light text-center">
                      <th className="p-0.5 border border-blue-custom text-[11px] font-bold text-black">ราคา/หน่วย</th>
                      <th className="p-0.5 border border-blue-custom text-[11px] font-bold text-black">จำนวนเงิน</th>
                      <th className="p-0.5 border border-blue-custom text-[11px] font-bold text-black">ราคา/หน่วย</th>
                      <th className="p-0.5 border border-blue-custom text-[11px] font-bold text-black">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan="8" className="p-0.5 border border-blue-custom h-1 bg-gray-50"></td></tr>
                    
                    {cat.items.map((item) => {
                      const matTotal = (Number(item.qty) || 0) * (Number(item.matPrice) || 0);
                      const laborTotal = (Number(item.qty) || 0) * (Number(item.laborPrice) || 0);
                      
                      let recommendedItems = masterBom.filter(b => b.catId === item.id.toString());
                      if (recommendedItems.length === 0) {
                          recommendedItems = masterBom.filter(b => b.catId === cat.id.toString());
                      }
                      const otherBomItems = masterBom.filter(b => !recommendedItems.includes(b));
                      
                      return (
                        <tr key={item.id} className="group hover:bg-blue-50/50">
                          <td className="p-1 border border-blue-custom text-center font-bold text-gray-700 relative">
                            <button onClick={() => handleRemoveItem(cat.id, item.id)} className="absolute -left-5 top-1 text-red-500 hover:text-white bg-red-100 hover:bg-red-500 rounded px-1 text-[10px] opacity-0 group-hover:opacity-100 transition-all no-print" title="ลบรายการนี้">✕</button>
                            {item.id}
                          </td>
                          <td className="p-1 border border-blue-custom relative">
                            <div className="flex items-center gap-1">
                              <input type="text" value={item.name} onChange={(e) => handleItemChange(cat.id, item.id, 'name', e.target.value)} className="clean-input font-bold text-gray-900 w-full" placeholder="ระบุรายการ..." />
                              
                              {masterBom.length > 0 && (
                                <div className="relative group/bom no-print shrink-0" title={`ดึงข้อมูลแนะนำสำหรับข้อ ${item.id}`}>
                                  <button className="text-white bg-blue-600 hover:bg-blue-700 rounded px-1 py-0 text-[9px] font-bold opacity-0 group-hover:opacity-100 shadow-sm flex items-center">
                                    ⚡
                                  </button>
                                  <select 
                                    onChange={(e) => { applyBomToItem(cat.id, item.id, e.target.value); e.target.value = ''; }} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  >
                                    <option value="" disabled selected>+ เลือกจากฐาน BOM...</option>
                                    {recommendedItems.length > 0 && (
                                      <optgroup label={`▶ แนะนำสำหรับข้อ ${item.id}`}>
                                        {recommendedItems.map(b => ( 
                                          <option key={b.id} value={b.id}>{b.name} (ของ {b.matPrice} / แรง {b.laborPrice})</option> 
                                        ))}
                                      </optgroup>
                                    )}
                                    {otherBomItems.length > 0 && (
                                      <optgroup label={`▶ รายการหมวดอื่นๆ`}>
                                        {otherBomItems.map(b => ( 
                                          <option key={b.id} value={b.id}>[หมวด {b.catId}] {b.name}</option> 
                                        ))}
                                      </optgroup>
                                    )}
                                  </select>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-1 border border-blue-custom text-center">
                            <input type="number" value={item.qty} onChange={(e) => handleItemChange(cat.id, item.id, 'qty', e.target.value)} className="clean-input text-center text-blue-700 font-extrabold" />
                          </td>
                          <td className="p-1 border border-blue-custom text-center">
                            <input type="text" value={item.unit} onChange={(e) => handleItemChange(cat.id, item.id, 'unit', e.target.value)} className="clean-input text-center font-bold text-gray-800" />
                          </td>
                          <td className="p-1 border border-blue-custom text-right pr-1">
                            <input type="number" value={item.matPrice} onChange={(e) => handleItemChange(cat.id, item.id, 'matPrice', e.target.value)} className="clean-input text-right text-blue-700 font-bold" />
                          </td>
                          <td className="p-1 border border-blue-custom text-right pr-1 font-bold text-gray-800 bg-gray-50">{formatNum(matTotal)}</td>
                          <td className="p-1 border border-blue-custom text-right pr-1">
                            <input type="number" value={item.laborPrice} onChange={(e) => handleItemChange(cat.id, item.id, 'laborPrice', e.target.value)} className="clean-input text-right text-teal-700 font-bold" />
                          </td>
                          <td className="p-1 border border-blue-custom text-right pr-1 font-bold text-gray-800 bg-gray-50">{formatNum(laborTotal)}</td>
                        </tr>
                      );
                    })}

                    <tr className="no-print">
                      <td colSpan="8" className="p-1.5 border border-blue-custom text-center bg-gray-50">
                        <button onClick={() => handleAddItem(cat.id)} className="text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[11px] font-bold px-3 py-0.5 rounded transition-colors shadow-sm">
                          + เพิ่มรายการ
                        </button>
                      </td>
                    </tr>
                    
                    <tr><td colSpan="8" className="border-x border-blue-custom border-b h-4"></td></tr>

                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-light border-2 border-blue-custom">
                      <td colSpan="5" className="p-1.5 border border-blue-custom text-center text-[12px] font-extrabold text-black">รวมหมวด {cat.id}</td>
                      <td className="p-1.5 pr-1 border border-blue-custom text-right font-extrabold text-black">{formatNum(totals.material)}</td>
                      <td className="p-1.5 border border-blue-custom"></td>
                      <td className="p-1.5 pr-1 border border-blue-custom text-right font-extrabold text-black">{formatNum(totals.labor)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
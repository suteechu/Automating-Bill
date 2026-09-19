import React, { useState, useEffect, useMemo } from 'react';
import Summary from './Summary';
import CategoryDetail from './CategoryDetail';
import CoverPage from './CoverPage';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import MasterBom from './MasterBom';
import AiMode from './AiMode';
import { initialCategories, emptyProjectInfo, variableGroups } from './constants';
import { THBText, sanitizeCategories, calculateAutoFillQty, getQtyRules, applyBulkPriceAdjustment } from './utils';
import defaultData from './default_data.json';

// ฟังก์ชันสำหรับแปลง ID เก่าที่ค้างในระบบ (item_...) ให้กลายเป็นเลขลำดับ (เช่น 1.1, 1.2) อัตโนมัติ
const fixOldIds = (cats) => {
  return cats.map(cat => {
    let maxSubId = 0;
    cat.items.forEach(item => {
      const parts = String(item.id).split('.');
      if (parts.length === 2 && parts[0] == cat.id) {
        const subId = parseInt(parts[1], 10);
        if (!isNaN(subId) && subId > maxSubId) maxSubId = subId;
      }
    });
    return {
      ...cat,
      items: cat.items.map(item => {
        if (String(item.id).startsWith('item_') || !String(item.id).includes('.')) {
          maxSubId++;
          return { ...item, id: `${cat.id}.${maxSubId}` };
        }
        return item;
      })
    };
  });
};

export default function App() {
  const [categories, setCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kid_bom_categories');
        if (saved) {
           let parsed = fixOldIds(sanitizeCategories(JSON.parse(saved)));
           // Update names from initialCategories and remove cat 15
           parsed = parsed
             .filter(c => c.id !== 15)
             .map(c => {
               const ic = initialCategories.find(i => i.id === c.id);
               return ic ? { ...c, name: ic.name } : c;
             });
           const missingCats = initialCategories.filter(ic => !parsed.some(pc => pc.id === ic.id));
           return [...parsed, ...missingCats];
        }
      } catch (e) {
        console.error("Error parsing categories from localStorage", e);
      }
    }
    return fixOldIds(defaultData.categories ? sanitizeCategories(defaultData.categories) : initialCategories);
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
      }
    }
    return defaultData.discountRounding || 0;
  });
  
  const [projectInfo, setProjectInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kid_bom_project_info');
        if (saved) {
           return { ...emptyProjectInfo, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error("Error parsing project info from localStorage", e);
      }
    }
    return { ...emptyProjectInfo, ...(defaultData.projectInfo || {}) };
  });

  const [masterBom, setMasterBom] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kid_bom_master');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Error parsing master BOM from localStorage", e);
      }
    }
    return defaultData.masterBom || [];
  });

  const [testFormula, setTestFormula] = useState({ name: '', unit: '', catId: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetName] = useState('Sheet1');

  const sheetId = '1qpAFF43n4ywYdVBpeR7eeO4wk7VY60amPxJptO-piyo';
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

  // --- START: Real-time Calculation Logic ---

  // 1. สร้าง state สำหรับ "debounce" ค่า projectInfo เพื่อป้องกันการคำนวณที่หนักหน่วงทุกครั้งที่พิมพ์
  //    โดย state นี้จะอัปเดตหลังจากผู้ใช้หยุดพิมพ์ไปแล้ว 400ms
  const [debouncedProjectInfo, setDebouncedProjectInfo] = useState(projectInfo);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedProjectInfo(projectInfo);
    }, 400); // 400ms delay

    // Cleanup: เคลียร์ timeout หาก component unmount หรือ projectInfo เปลี่ยนอีกครั้ง
    return () => {
      clearTimeout(timerId);
    };
  }, [projectInfo]); // Effect นี้จะทำงานทุกครั้งที่ projectInfo ต้นฉบับมีการเปลี่ยนแปลง


  // 2. Core Effect สำหรับการคำนวณแบบเรียลไทม์ ซึ่งจะทำงานเมื่อ "debouncedProjectInfo" เปลี่ยนแปลง
  useEffect(() => {
    setCategories(prevCategories => {
      let hasChanged = false;
      const newCategories = prevCategories.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          const { value: autoQty } = calculateAutoFillQty(item.name, item.unit, cat.id, debouncedProjectInfo);
          
          // อัปเดตเฉพาะเมื่อมีสูตรคำนวณ และค่าที่ได้ไม่ตรงกับค่าปัจจุบัน
          if (autoQty !== null && item.qty !== autoQty) {
            hasChanged = true;
            return { ...item, qty: autoQty };
          }
          return item;
        })
      }));

      // อัปเดต state ก็ต่อเมื่อมีการเปลี่ยนแปลงเกิดขึ้นจริงๆ เพื่อประสิทธิภาพที่ดีขึ้น
      return hasChanged ? newCategories : prevCategories;
    });
  }, [debouncedProjectInfo]); // Dependency array ทำให้ effect นี้ทำงานเมื่อค่าที่ debounce แล้วเปลี่ยนเท่านั้น

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
    
    let totalMat = 0, totalLab = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        const q = item.qty === '-' ? 0 : Number(item.qty) || 0;
        totalMat += q * (Number(item.matPrice) || 0);
        totalLab += q * (Number(item.laborPrice) || 0);
      });
    });
    const subTotal = totalMat + totalLab;
    const currentGrandTotal = Math.round(subTotal + (subTotal * profitMargin) - (Number(discountRounding) || 0));
    
    let formattedBudget = '';
    if (currentGrandTotal >= 1000000) {
      formattedBudget = (currentGrandTotal / 1000000).toFixed(1) + 'ล้าน';
    } else {
      formattedBudget = (currentGrandTotal / 100000).toFixed(1) + 'แสน';
    }
    
    const ownerName = projectInfo.owner || projectInfo.name || 'Project';
    const area = projectInfo.area || 0;
    const fileName = `BOQ ${ownerName} (${area} & ${formattedBudget}).json`;
    downloadAnchorNode.setAttribute("download", fileName);
    
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
        if (data.projectInfo) setProjectInfo({ ...emptyProjectInfo, ...data.projectInfo });
        if (data.categories) setCategories(fixOldIds(sanitizeCategories(data.categories)));
        if (data.discountRounding !== undefined) setDiscountRounding(data.discountRounding);
        if (data.masterBom) setMasterBom(data.masterBom);
        alert('โหลดโปรเจกต์สำเร็จ!');
      } catch {
        alert('ไฟล์โปรเจกต์ไม่ถูกต้อง หรืออาจเสียหาย');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const saveAsDefaultTemplate = () => {
    if (window.confirm('คุณต้องการบันทึกสถานะโปรเจกต์ปัจจุบันเป็นเทมเพลตเริ่มต้นหรือไม่? (เทมเพลตเดิมจะถูกเขียนทับ)')) {
        const templateData = {
            projectInfo,
            categories,
            discountRounding,
        };
        localStorage.setItem('kid_bom_user_template', JSON.stringify(templateData));
        alert('บันทึกเทมเพลตเริ่มต้นสำเร็จ!\nครั้งต่อไปที่คุณกด "เริ่มโปรเจกต์ใหม่" ระบบจะใช้เทมเพลตนี้');
    }
  };

  const resetProject = () => {
    if (window.confirm('คุณต้องการเริ่มโปรเจกต์ใหม่โดยดึงข้อมูลทั้งหมดจากฐาน BOM หรือไม่? (ข้อมูลที่ยังไม่บันทึกจะหายไป)')) {
        // 1. Handle Project Info and other settings (load from template if available)
        const userTemplateJson = localStorage.getItem('kid_bom_user_template');
        let infoToUse = { ...emptyProjectInfo };
        let discountToUse = 0;

        if (userTemplateJson) {
            try {
                const data = JSON.parse(userTemplateJson);
                infoToUse = { ...emptyProjectInfo, ...(data.projectInfo || {}) };
                discountToUse = data.discountRounding !== undefined ? data.discountRounding : 0;
            } catch (e) {
                console.error("Failed to load user template for project info.", e);
            }
        }
        
        setProjectInfo(infoToUse);
        setDiscountRounding(discountToUse);
        setProfitMargin(0.05); // Always reset profit margin

        // 2. Build categories from Master BOM
        if (masterBom.length === 0) {
            alert("ฐานข้อมูล Master BOM ว่างเปล่า ไม่มีรายการให้ดึง");
            setCategories([]); // Set to empty if BOM is empty
            return;
        }

        // Start with a clean slate of all possible categories from constants, but with empty items arrays.
        const allCatsWithEmptyItems = initialCategories.map(c => ({ ...c, items: [] }));

        // Create a map for quick lookup: Map<string, Category>
        const categoryMap = new Map(allCatsWithEmptyItems.map(c => [String(c.id), c]));

        masterBom.forEach(bomItem => {
            if (!bomItem.catId) return; // Skip items without a category ID

            const category = categoryMap.get(String(bomItem.catId));
            if (category) {
                // Calculate quantity based on the project info we just set
                const { value: autoQty } = calculateAutoFillQty(bomItem.name, bomItem.unit, bomItem.catId, infoToUse);

                const newItem = {
                    id: `bom_${bomItem.id}`, // Temporary ID for fixOldIds to replace
                    name: bomItem.name || '', unit: bomItem.unit || '',
                    matPrice: bomItem.matPrice || 0, laborPrice: bomItem.laborPrice || 0,
                    qty: autoQty !== null ? autoQty : '-',
                    bomId: bomItem.id,
                };
                category.items.push(newItem);
            }
        });

        const populatedCategories = Array.from(categoryMap.values()).filter(cat => cat.items.length > 0);
        const finalCategories = fixOldIds(populatedCategories);
        setCategories(finalCategories);
        alert(`สร้างโปรเจกต์ใหม่จาก Master BOM สำเร็จ! (${masterBom.length} รายการ)`);
    }
  };

  const clearMasterBom = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลฐาน BOM ทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      setMasterBom([]);
    }
  };

  const exportMasterBomToCSV = () => {
    if (masterBom.length === 0) {
      alert('ไม่มีข้อมูลสำหรับนำออก');
      return;
    }
    
    let csvContent = "หมวดงาน,รายการวัสดุ,หน่วย,ค่าวัสดุ/หน่วย,ค่าแรง/หน่วย\n";
    
    masterBom.forEach(item => {
      const catId = item.catId || '';
      const name = `"${(item.name || '').replace(/"/g, '""')}"`;
      const unit = `"${(item.unit || '').replace(/"/g, '""')}"`;
      const matPrice = item.matPrice || 0;
      const laborPrice = item.laborPrice || 0;
      
      csvContent += `${catId},${name},${unit},${matPrice},${laborPrice}\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'DATA_BOM_EXPORT.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const syncGoogleSheet = async (silent = false) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      // ดึงจาก Google Sheets โดยตรง
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
      
      const text = await response.text(); 
      const rows = text.split(/\r?\n/);
      
      if (rows.length < 2 || text.includes('<!DOCTYPE html>')) {
         if (!silent) alert(`ไม่พบข้อมูลในชีตชื่อ "${sheetName}" หรือชีตนั้นว่างเปล่า\nกรุณาตรวจสอบชื่อชีตให้ตรงกับใน Google Sheets`);
         setIsSyncing(false);
         return;
      }

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
        
        let catId = cols[0] || '';      
        let name = cols[1] || '';       
        let unit = cols[3] || '';             
        let matPrice = parseFloat(cols[4].replace(/[^\d.-]/g, '')) || 0;   
        let laborPrice = parseFloat(cols[5].replace(/[^\d.-]/g, '')) || 0; 

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
      
      setMasterBom(newBom);
      if (!silent) alert(`ซิงค์ข้อมูลจาก "${sheetName}" สำเร็จ! (${newBom.length} รายการ)`);
      
    } catch (err) {
       if (!silent) alert('เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheets กรุณาตรวจสอบลิงก์การแชร์ไฟล์ หรือชื่อชีตอาจไม่ถูกต้อง');
       console.error("Sync error:", err);
    } finally {
       setIsSyncing(false);
    }
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
          const { value: autoQty } = calculateAutoFillQty(bom.name, bom.unit, cat.id, projectInfo);
          return { 
            ...item, 
            bomId: bom.id,
            name: bom.name || '', 
            unit: bom.unit || '', 
            matPrice: bom.matPrice || 0, 
            laborPrice: bom.laborPrice || 0,
            qty: autoQty !== null ? autoQty : item.qty
          };
        })
      };
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const updateItemFromBom = (catId, itemId) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;

          let bom = null;
          if (item.bomId) bom = masterBom.find(b => b.id === item.bomId);
          if (!bom) bom = masterBom.find(b => b.name === item.name);

          if (!bom) {
            alert(`ไม่พบรายการ "${item.name}" ในฐานข้อมูล BOM\nกรุณาเลือกใหม่ผ่านปุ่มสายฟ้า (⚡)`);
            return item;
          }

          const { value: autoQty } = calculateAutoFillQty(bom.name, bom.unit, cat.id, projectInfo);

          return {
            ...item,
            bomId: bom.id,
            name: bom.name || '',
            unit: bom.unit || '',
            matPrice: bom.matPrice || 0,
            laborPrice: bom.laborPrice || 0,
            qty: autoQty !== null ? autoQty : item.qty
          };
        })
      };
    }));
  };

  const updateAllFromBom = () => {
    if (!window.confirm('ต้องการดึงราคาและคำนวณสูตร "ทุกรายการ" ใน BOQ ใหม่ตามฐาน BOM ล่าสุดหรือไม่?')) return;
    
    setCategories(categories.map(cat => ({
      ...cat,
      items: cat.items.map(item => {
        let bom = null;
        if (item.bomId) bom = masterBom.find(b => b.id === item.bomId);
        if (!bom) bom = masterBom.find(b => b.name === item.name);
        
        if (!bom) return item; 
        
        const { value: autoQty } = calculateAutoFillQty(bom.name, bom.unit, cat.id, projectInfo);
        
        return {
          ...item,
          bomId: bom.id,
          name: bom.name || '',
          unit: bom.unit || '',
          matPrice: bom.matPrice || 0,
          laborPrice: bom.laborPrice || 0,
          qty: autoQty !== null ? autoQty : item.qty
        };
      })
    })));
    
    alert('อัปเดตข้อมูลทุกรายการตามฐาน BOM สำเร็จ!');
  };



  const handleBulkPriceAdjust = (targetCatId, percentage, priceTypes) => {
    // applyBulkPriceAdjustment is now imported at the top
    const updatedCategories = applyBulkPriceAdjustment(categories, targetCatId, percentage, priceTypes);
    setCategories(updatedCategories);
    const targetName = categories.find(c => c.id === targetCatId)?.name || 'ทุกหมวด';
    alert(`ปรับราคาสำหรับหมวด "${targetName}" สำเร็จ!`);
  };

  const formatNum = (num) => (!isNaN(num) && num !== null && num !== '') ? Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';



  const handleItemChange = (catId, itemId, field, value) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          let val = value;
          if (field === 'qty') {
            if (value === '' || value === '-') {
                val = '-';
            } else {
                // ทำให้สอดคล้องกัน: ป้องกันค่าลบโดยใช้ Math.abs และปัดเศษขึ้นเสมอ
                val = Math.ceil(Math.abs(parseFloat(value) || 0));
            }
          } else if (field === 'matPrice' || field === 'laborPrice') {
             val = value === '' ? '' : parseFloat(value) || 0;
          }
          return { ...item, [field]: val };
        })
      };
    }));
  };

  const handleMoveItem = (catId, index, direction) => {
    setCategories(prevCategories => prevCategories.map(cat => {
      if (cat.id !== catId) return cat;
      
      const newItems = [...cat.items];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= newItems.length) {
        return cat;
      }
      
      // สลับตำแหน่งไอเทม
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      
      // แก้ไข ID ของทุกไอเทมในหมวดหมู่นี้ใหม่เพื่อให้เรียงลำดับถูกต้อง
      const finalItems = newItems.map((item, itemIndex) => ({ ...item, id: `${cat.id}.${itemIndex + 1}` }));
      return { ...cat, items: finalItems };
    }));
  };

  const handleAddItem = (catId) => {
    setCategories(prevCategories => prevCategories.map(cat => {
      if (cat.id !== catId) return cat;

      let maxSubId = 0;
      cat.items.forEach(item => {
        const parts = String(item.id).split('.');
        if (parts.length === 2 && parts[0] == cat.id) {
            const subId = parseInt(parts[1], 10);
            if (!isNaN(subId) && subId > maxSubId) maxSubId = subId;
        }
      });
      const newItemId = `${cat.id}.${maxSubId + 1}`;
      const newItem = { id: newItemId, name: 'รายการใหม่', qty: '-', unit: 'หน่วย', matPrice: 0, laborPrice: 0 };
      return { ...cat, items: [...cat.items, newItem] };
    }));
  };

  const handleRemoveItem = (catId, itemId) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      const updatedItems = cat.items.filter(item => item.id !== itemId);
      const finalItems = updatedItems.map((item, itemIndex) => ({ ...item, id: `${cat.id}.${itemIndex + 1}` }));
      return { ...cat, items: finalItems };
    }));
  };

  const getCategoryTotals = (cat) => {
    const material = cat.items.reduce((sum, item) => sum + ((item.qty === '-' ? 0 : Number(item.qty) || 0) * (Number(item.matPrice) || 0)), 0);
    const labor = cat.items.reduce((sum, item) => sum + ((item.qty === '-' ? 0 : Number(item.qty) || 0) * (Number(item.laborPrice) || 0)), 0);
    return { material, labor, total: material + labor };
  };

  const { summaryRows, grandTotalMaterial, grandTotalLabor } = useMemo(() => {
    let grandTotalMaterial = 0;
    let grandTotalLabor = 0;
    const summaryRows = categories.map(cat => {
      const totals = getCategoryTotals(cat);
      grandTotalMaterial += totals.material;
      grandTotalLabor += totals.labor;
      return { id: cat.id, name: cat.name, ...totals };
    });
    return { summaryRows, grandTotalMaterial, grandTotalLabor };
  }, [categories]);

  const subTotal = grandTotalMaterial + grandTotalLabor;
  const overheadProfit = subTotal * profitMargin;
  const totalWithProfit = subTotal + overheadProfit;
  const grandTotal = Math.round(totalWithProfit - (Number(discountRounding) || 0));

  const costPerSqm = (parseFloat(projectInfo.area) || 0) > 0 ? (grandTotal / projectInfo.area) : 0;
  const matPercent = subTotal > 0 ? (grandTotalMaterial / subTotal) * 100 : 0;
  const laborPercent = subTotal > 0 ? (grandTotalLabor / subTotal) * 100 : 0;
  
  const sortedCategories = [...summaryRows].sort((a, b) => b.total - a.total);
  const maxCategoryTotal = sortedCategories[0]?.total || 1;
  
  const handlePrint = () => {
    let formattedBudget = '';
    if (grandTotal >= 1000000) {
      formattedBudget = (grandTotal / 1000000).toFixed(1) + 'ล้าน';
    } else {
      formattedBudget = (grandTotal / 100000).toFixed(1) + 'แสน';
    }
    const ownerName = projectInfo.owner || projectInfo.name || 'Project';
    const area = projectInfo.area || 0;
    const fileName = `BOQ ${ownerName} (${area} & ${formattedBudget})`;
    document.title = fileName;
    window.print();
  };
  const liveQtyRules = getQtyRules(projectInfo);
  const simResult = calculateAutoFillQty(testFormula.name, testFormula.unit, testFormula.catId, projectInfo);

  const groupedMasterBom = masterBom.reduce((acc, item) => {
    const cat = item.catId ? item.catId.toString().trim() : '';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const manualInputItems = useMemo(() => 
    categories.flatMap(cat => 
      cat.items
        .filter(item => {
          const hasNoFormula = calculateAutoFillQty(item.name, item.unit, cat.id, projectInfo).value === null;
          const isNotLinked = !item.bomId;
          const needsInput = item.qty === '-';
          // แสดงในลิสต์ "Manual" ก็ต่อเมื่อ:
          // 1. ไม่มีสูตรคำนวณอัตโนมัติ
          // 2. ยังไม่ได้ผูกกับ Master BOM
          // 3. และยังคงมีค่าเป็นค่าเริ่มต้น ('-') ที่รอการกรอกข้อมูล
          return hasNoFormula && isNotLinked && needsInput;
        })
        .map(item => ({ ...item, categoryName: cat.name, catId: cat.id }))
    )
  , [categories, projectInfo]);

  // ฟังก์ชันสร้างช่องกรอกข้อมูลขนาดจิ๋ว (Minimalist Style) ป้องกัน undefined
  // eslint-disable-next-line no-unused-vars
  const renderMiniInput = (label, field, val, tooltipText) => (
    <div className="flex flex-col shrink-0" title={tooltipText}>
      <label className="block text-[9px] text-slate-500 mb-0.5 whitespace-nowrap font-sans font-medium uppercase">
        {label}
      </label>
      <input 
        type="number" 
        value={val !== undefined && val !== null ? val : ''} 
        onChange={e => {
          if (e.target.value.length <= 7) handleProjectInfoChange(field, e.target.value === '' ? '' : Number(e.target.value));
        }} 
        className="w-[62px] bg-slate-100 border-transparent rounded px-1 py-1 text-[11px] font-bold text-center text-slate-800 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all" 
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-200 font-sans text-gray-800 print:bg-white font-smk">
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
          .page-break-after {
              page-break-after: always !important;
              break-after: page !important;
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
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
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

      {/* แถบเมนูด้านซ้าย (Sidebar) แทนที่ Navbar แนวนอนเดิม */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        categories={categories} 
        updateAllFromBom={updateAllFromBom} 
        syncGoogleSheet={syncGoogleSheet} 
        isSyncing={isSyncing} 
        handlePrint={handlePrint}
        grandTotal={grandTotal}
        profitMargin={profitMargin}
        discountRounding={discountRounding}
        formatNum={formatNum}
        sheetUrl={sheetUrl}
        handleBulkPriceAdjust={handleBulkPriceAdjust}
        saveAsDefaultTemplate={saveAsDefaultTemplate}
      />

      {/* พื้นที่เนื้อหาหลัก (Main Content) */}
      <main className="flex-1 py-8 overflow-x-auto print:py-0 print:overflow-visible">
        {/* สั่ง print:block ไว้ที่ตัวครอบสุด เพื่อให้ไหลไปได้หลายๆ หน้า */}
        <div className="flex flex-col items-center gap-10 print:block min-w-max">

          {/* =========================================
              หน้า 0: หน้าปก (COVER PAGE) - สำหรับพิมพ์เท่านั้น
          ========================================== */}
          <div className="hidden print:block page-break-after">
            <CoverPage projectInfo={projectInfo} />
          </div>

          {/* =========================================
              หน้า 0.1: DASHBOARD
          ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="transform scale-110 origin-top mt-4 mb-24 flex flex-col items-center gap-6 w-full no-print">
              <Dashboard
                  projectInfo={projectInfo}
                  handleProjectInfoChange={handleProjectInfoChange}
                  resetProject={resetProject}
                  importProjectFromJSON={importProjectFromJSON}
                  exportProjectToJSON={exportProjectToJSON}
                  saveAsDefaultTemplate={saveAsDefaultTemplate}
                  formatNum={formatNum}
                  grandTotal={grandTotal}
                  costPerSqm={costPerSqm}
                  profitMargin={profitMargin}
                  overheadProfit={overheadProfit}
                  matPercent={matPercent}
                  laborPercent={laborPercent}
                  grandTotalMaterial={grandTotalMaterial}
                  grandTotalLabor={grandTotalLabor}
                  sortedCategories={sortedCategories}
                  subTotal={subTotal}
                  maxCategoryTotal={maxCategoryTotal}
              />
            </div>
          )}

          {/* =========================================
              หน้า 0.1.5: VARIABLES & SIMULATOR
          ========================================== */}
          {(activeTab === 'variables' || activeTab === 'simulator') && (
            <div className="w-full max-w-6xl mx-auto mt-6 mb-24 px-4">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 text-gray-800 font-smk no-print print:hidden">
                <div className="border-b border-gray-200 pb-5 mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                    <span className="text-3xl">{activeTab === 'variables' ? '📐' : '🧪'}</span> 
                    {activeTab === 'variables' ? 'ตัวแปรโครงสร้างที่ใช้คำนวณ (Structural Variables)' : 'จำลองสูตรคำนวณอัตโนมัติ (Simulator & Rules)'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2 font-medium">
                    {activeTab === 'variables' 
                      ? 'จัดการตัวแปรหลักทั้งหมดที่ใช้สำหรับคำนวณปริมาณวัสดุอัตโนมัติ' 
                      : 'ทดสอบสูตรที่มีในพจนานุกรม และตรวจสอบรายการที่ระบบไม่ทราบจำนวน'}
                  </p>
                </div>

                {activeTab === 'variables' ? (
                  /* TAB: VARIABLES */
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {variableGroups.map(group => (
                        <div key={group.title} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <h4 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider mb-4 pb-2 border-b border-blue-100">{group.title}</h4>
                          <div className="flex flex-col gap-3">
                            {group.fields.map(field => {
                              const value = projectInfo[field.key];
                              const isMissing = value === undefined || value === null || value === '' || value === 0;

                              return (
                                <div key={field.key} className="flex justify-between items-center group gap-2" title={field.tooltip}>
                                  <span className={`font-medium text-sm flex items-center gap-1.5 leading-tight flex-1 ${isMissing ? 'text-red-600' : 'text-gray-700'}`}>
                                    {isMissing && <span className="text-red-500 animate-pulse" title="กรุณาระบุค่าตัวแปรนี้">⚠️</span>}
                                    {field.label}
                                    {field.tooltip && <span className={`${isMissing ? 'text-red-400 border-red-400 group-hover:text-red-600' : 'text-gray-400 border-gray-400 group-hover:text-blue-500'} cursor-help text-[10px] border rounded-full min-w-[16px] w-4 h-4 flex items-center justify-center transition-colors shrink-0`}>?</span>}
                                  </span>
                                  <input 
                                    type="number" 
                                    value={value || ''} 
                                    onChange={e => handleProjectInfoChange(field.key, e.target.value === '' ? '' : Number(e.target.value))} 
                                    className={`w-24 shrink-0 text-right border rounded-md px-2 py-1.5 outline-none focus:ring-1 font-bold text-sm transition-all ${isMissing ? 'border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'}`} 
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* TAB: SIMULATOR */
                  <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Section 2: Simulator */}
                      <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 shadow-sm flex flex-col h-full">
                        <h3 className="text-lg font-bold text-purple-800 mb-5 flex items-center gap-2 pb-3 border-b border-purple-200/50">
                          🧪 จำลองการทำงานของสูตร
                        </h3>
                        <div className="flex flex-col gap-5 flex-1 justify-center">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อวัสดุ / รายการ (Keyword)</label>
                            <input type="text" value={testFormula.name} onChange={e => setTestFormula({...testFormula, name: e.target.value})} className="w-full bg-white border border-purple-300 rounded-lg px-4 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-bold text-base transition-all shadow-sm" placeholder="เช่น กระเบื้องซีแพค, สีทาภายใน" />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">หน่วย (Unit)</label>
                              <input type="text" value={testFormula.unit} onChange={e => setTestFormula({...testFormula, unit: e.target.value})} className="w-full bg-white border border-purple-300 rounded-lg px-4 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-bold text-base transition-all shadow-sm" placeholder="เช่น ตร.ม." />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">หมวดงาน (Cat ID)</label>
                              <input type="text" value={testFormula.catId} onChange={e => setTestFormula({...testFormula, catId: e.target.value})} className="w-full bg-white border border-purple-300 rounded-lg px-4 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-bold text-base transition-all shadow-sm" placeholder="เช่น 11" />
                            </div>
                          </div>

                          <div className="bg-white p-5 rounded-xl border border-purple-200 text-center shadow-inner mt-4">
                            <p className="text-sm font-bold text-gray-500 mb-3">ปริมาณที่ระบบคำนวณให้ (Qty)</p>
                            <div className="text-5xl font-extrabold text-purple-700 h-16 flex items-center justify-center">
                                {simResult.value !== null
                                  ? simResult.value
                                  : <span className="text-gray-300 text-2xl font-medium">ไม่มีสูตรตรงเงื่อนไข</span>}
                            </div>
                            {simResult.matchedRule && (
                              <div className="text-sm text-purple-700 mt-4 font-medium bg-purple-100/50 px-4 py-3 rounded-lg border border-purple-100">
                                  <b className="mr-2">สูตรที่ถูกใช้:</b> {simResult.matchedRule.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Live Rules Dictionary */}
                      <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm flex flex-col h-[520px]">
                          <h3 className="text-lg font-bold text-green-800 mb-4 pb-3 border-b border-green-200/50">📖 พจนานุกรมสูตรที่มีในระบบ (คลิกเพื่อทดสอบ)</h3>
                          <div className="flex-1 overflow-y-auto pr-3 space-y-3 custom-scrollbar">
                            {liveQtyRules.map((rule, index) => (
                              <div 
                                key={index}
                                onClick={() => setTestFormula({ name: rule.keywords[0] || '', unit: '', catId: rule.catId || '' })}
                                className="flex items-center bg-white p-3 rounded-xl border border-green-100 hover:bg-green-100 hover:border-green-300 cursor-pointer transition-all shadow-sm group"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-green-900 text-base truncate group-hover:text-green-700" title={rule.keywords.join(', ')}>
                                    {rule.keywords.join(', ') || '(เงื่อนไขพิเศษ)'}
                                  </p>
                                  <p className="text-gray-500 font-medium text-sm mt-1 truncate">
                                    {`↳ ${rule.description || 'สูตรกำหนดเอง'}`}
                                  </p>
                                </div>
                                <div 
                                  className={`ml-4 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 border ${
                                    rule.usesVariable 
                                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                      : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}
                                >
                                  {rule.usesVariable ? 'อิงตัวแปร' : 'ค่าคงที่'}
                                </div>
                              </div>
                            ))}
                          </div>
                      </div>
                    </div>

                    {/* Section 4: Manual Input List */}
                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
                      <h3 className="text-lg font-bold text-yellow-800 mb-5 pb-3 border-b border-yellow-200/50">
                        📝 รายการที่ระบบไม่ทราบจำนวน ต้องกรอกด้วยตนเอง (Manual Input Needed)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {manualInputItems.length > 0 ? manualInputItems.map(item => (
                          <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.catId)}
                            className="text-left bg-white p-4 rounded-xl border border-yellow-300 hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm group"
                          >
                            <p className="font-bold text-base text-gray-800 group-hover:text-blue-700 transition-colors">{item.name}</p>
                            <p className="text-sm text-gray-500 mt-2">อยู่ใน: {item.categoryName}</p>
                          </button>
                        )) : (
                          <p className="text-base font-medium text-gray-500 italic p-6 bg-white rounded-xl border border-dashed border-gray-300 col-span-full text-center">
                            เยี่ยมมาก! ทุกรายการถูกคำนวณปริมาณอัตโนมัติแล้ว 🎉
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================
              หน้า 0.1.6: AI MODE
          ========================================== */}
          {activeTab === 'ai' && (
            <AiMode 
              projectInfo={projectInfo}
              categories={categories}
              formatNum={formatNum}
            />
          )}

          {/* =========================================
              หน้า 0.2: ฐานข้อมูล BOM 
          ========================================== */}
          {activeTab === 'bom' && (
            <MasterBom 
              masterBom={masterBom}
              groupedMasterBom={groupedMasterBom}
              addMasterBom={addMasterBom}
              exportMasterBomToCSV={exportMasterBomToCSV}
              handleFileUpload={handleFileUpload}
              clearMasterBom={clearMasterBom}
              removeMasterBom={removeMasterBom}
              handleMasterBomChange={handleMasterBomChange}
            />
          )}

          {/* =========================================
              หน้า 1: หน้าสรุป (SUMMARY)
          ========================================== */}
          <Summary 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            categoriesLength={categories.length}
            summaryRows={summaryRows}
            grandTotalMaterial={grandTotalMaterial}
            grandTotalLabor={grandTotalLabor}
            subTotal={subTotal}
            profitMargin={profitMargin}
            overheadProfit={overheadProfit}
            discountRounding={discountRounding}
            setDiscountRounding={setDiscountRounding}
            grandTotal={grandTotal}
            formatNum={formatNum}
            THBText={THBText}
            projectInfo={projectInfo}
          />

          {/* =========================================
              หน้า 2-N: หน้ารายละเอียด (BREAKDOWN)
          ========================================== */}
          {categories.map((cat, index) => {
            // เพิ่มเลขลำดับที่ถูกต้องเข้าไปในแต่ละ item ก่อนส่งไปแสดงผล
            const categoryWithNumberedItems = {
              ...cat,
              items: cat.items.map((item, itemIndex) => ({
                ...item,
                displayNumber: itemIndex + 1,
              })),
            };
            return (
              <CategoryDetail
                key={cat.id}
                cat={categoryWithNumberedItems}
                index={index}
                activeTab={activeTab}
                categoriesLength={categories.length}
                projectInfo={projectInfo}
                getCategoryTotals={getCategoryTotals}
                masterBom={masterBom}
                formatNum={formatNum}
                handleRemoveItem={handleRemoveItem}
                handleItemChange={handleItemChange}
                applyBomToItem={applyBomToItem}
                handleAddItem={handleAddItem}
                handleMoveItem={handleMoveItem}
              />
            );
          })}

        </div>
      </main>
    </div>
  );
}
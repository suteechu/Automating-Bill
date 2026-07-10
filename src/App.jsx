import React, { useState, useEffect } from 'react';
import Summary from './Summary';
import CategoryDetail from './CategoryDetail';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import MasterBom from './MasterBom';
import { initialCategories, emptyProjectInfo } from './constants';
import { THBText, sanitizeCategories, calculateAutoFillQty } from './utils';
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
           return fixOldIds(sanitizeCategories(JSON.parse(saved)));
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
  const [sheetName, setSheetName] = useState('Sheet1'); 

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
    
    const fileName = `BOQ ${projectInfo.owner || projectInfo.name || 'Project'} (${projectInfo.area || 0} ตร.ม.).json`;
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
      } catch (err) {
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
                const autoQty = calculateAutoFillQty(bomItem.name, bomItem.unit, bomItem.catId, infoToUse);

                const newItem = {
                    id: `bom_${bomItem.id}`, // Temporary ID for fixOldIds to replace
                    name: bomItem.name || '', unit: bomItem.unit || '',
                    matPrice: bomItem.matPrice || 0, laborPrice: bomItem.laborPrice || 0,
                    qty: autoQty !== null ? autoQty : 1, // Default to 1 if no formula applies
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
      const sheetId = '1qpAFF43n4ywYdVBpeR7eeO4wk7VY60amPxJptO-piyo';
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
      
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
          const autoQty = calculateAutoFillQty(bom.name, bom.unit, cat.id, projectInfo);
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

          const autoQty = calculateAutoFillQty(bom.name, bom.unit, cat.id, projectInfo);

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
        
        const autoQty = calculateAutoFillQty(bom.name, bom.unit, cat.id, projectInfo);
        
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

  const formatNum = (num) => (!isNaN(num) && num !== null && num !== '') ? Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

  const handlePrint = () => {
    const fileName = `BOQ ${projectInfo.owner || projectInfo.name || 'Project'} (${projectInfo.area || 0} ตร.ม.)`;
    document.title = fileName;
    window.print();
  };

  const handleItemChange = (catId, itemId, field, value) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          let val = value;
          if (field === 'qty') {
             val = value === '' ? '' : Math.ceil(parseFloat(value) || 0);
          } else if (field === 'matPrice' || field === 'laborPrice') {
             val = value === '' ? '' : parseFloat(value) || 0;
          }
          return { ...item, [field]: val };
        })
      };
    }));
  };

  const handleMoveItem = (catId, index, direction) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      const newItems = [...cat.items];
      if (index + direction < 0 || index + direction >= newItems.length) return cat;
      
      const temp = newItems[index];
      newItems[index] = newItems[index + direction];
      newItems[index + direction] = temp;
      
      return { ...cat, items: newItems };
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
      const newItem = { id: newItemId, name: 'รายการใหม่', qty: 1, unit: 'หน่วย', matPrice: 0, laborPrice: 0 };
      return { ...cat, items: [...cat.items, newItem] };
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
  const grandTotal = Math.round(totalWithProfit - (Number(discountRounding) || 0));

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

  // ฟังก์ชันสร้างช่องกรอกข้อมูลขนาดจิ๋ว (Minimalist Style) ป้องกัน undefined
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
      />

      {/* พื้นที่เนื้อหาหลัก (Main Content) */}
      <main className="flex-1 py-8 overflow-x-auto print:py-0 print:overflow-visible">
        {/* สั่ง print:block ไว้ที่ตัวครอบสุด เพื่อให้ไหลไปได้หลายๆ หน้า */}
        <div className="flex flex-col items-center gap-10 print:block min-w-max">

          {/* =========================================
              หน้า 0.1: DASHBOARD
          ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="transform scale-110 origin-top mt-4 mb-24 flex justify-center w-full">
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
              หน้า 0.1.5: RECHECK FORMULAS & ADVANCED PARAMS
          ========================================== */}
          {activeTab === 'recheck' && (
            <div className="transform scale-110 origin-top mt-4 mb-24 flex justify-center w-full">
              <div className="w-[210mm] bg-white rounded shadow-xl border border-gray-300 p-6 text-gray-800 no-print print:hidden font-smk">
                <div className="border-b border-gray-300 pb-4 mb-4">
                <h2 className="text-xl font-extrabold text-gray-900">🔍 รีเช็คสูตร & ตัวแปรเชิงลึก (Formula & Parameters)</h2>
                <p className="text-gray-600 text-[12px] mt-0.5 font-bold">ทดสอบสูตรการคำนวณและกำหนดค่าตัวแปรโครงสร้างที่ใช้ในสูตรอัตโนมัติ (Advanced Variables)</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Section 1: Simulator */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 flex flex-col">
                  <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                    🧪 ทดสอบคำนวณปริมาณอัตโนมัติ (Simulator)
                  </h3>
                  <div className="flex flex-col gap-3 flex-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">ชื่อวัสดุ / รายการ (Keyword)</label>
                      <input type="text" value={testFormula.name} onChange={e => setTestFormula({...testFormula, name: e.target.value})} className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-purple-500 font-bold text-sm" placeholder="เช่น กระเบื้องซีแพค, สีทาภายใน" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">หน่วย (Unit)</label>
                          <input type="text" value={testFormula.unit} onChange={e => setTestFormula({...testFormula, unit: e.target.value})} className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-purple-500 font-bold text-sm" placeholder="เช่น ตร.ม., ม." />
                      </div>
                      <div className="flex-1">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">หมวดงาน (Cat ID)</label>
                          <input type="text" value={testFormula.catId} onChange={e => setTestFormula({...testFormula, catId: e.target.value})} className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-purple-500 font-bold text-sm" placeholder="เช่น 11" />
                      </div>
                    </div>

                    <div className="mt-auto bg-white p-4 rounded border border-purple-200 text-center shadow-inner">
                      <p className="text-[11px] font-bold text-gray-500 mb-1">ปริมาณที่ระบบจะใส่ให้อัตโนมัติ (Qty)</p>
                      <div className="text-3xl font-extrabold text-purple-700">
                          {calculateAutoFillQty(testFormula.name, testFormula.unit, testFormula.catId, projectInfo) !== null
                            ? calculateAutoFillQty(testFormula.name, testFormula.unit, testFormula.catId, projectInfo)
                            : <span className="text-gray-300 text-lg">ไม่เข้าเงื่อนไขสูตร</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Advanced Variables */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    📐 ตัวแปรโครงสร้างที่ใช้คำนวณ (Structural Variables)
                  </h3>
                  <div className="grid grid-cols-1 gap-y-2 text-[12px] h-[220px] overflow-y-auto no-scrollbar pr-2">
                    {[
                      { key: 'roofArea', label: 'พื้นที่หลังคา (ตร.ม.)' },
                      { key: 'bathroomArea', label: 'พื้นที่ห้องน้ำรวม (ตร.ม.)' },
                      { key: 'bedroomArea', label: 'พื้นที่ห้องนอนรวม (ตร.ม.)' },
                      { key: 'kitchenArea', label: 'พื้นที่ห้องครัว (ตร.ม.)' },
                      { key: 'perimeter', label: 'ความยาวเส้นรอบรูปอาคาร (ม.)' },
                      { key: 'beamLength', label: 'ความยาวคานรวม (ม.)' },
                      { key: 'aseLength', label: 'ความยาวอะเส (ม.)' },
                      { key: 'rafterLength', label: 'ความยาวจันทัน (ม.)' },
                      { key: 'purlinLength', label: 'ความยาวแป (ม.)' },
                      { key: 'foundationCount', label: 'จำนวนฐานราก (หลุม)' },
                      { key: 'intWallArea', label: 'พื้นที่ผนังภายใน (ตร.ม.)' },
                      { key: 'extWallArea', label: 'พื้นที่ผนังภายนอก (ตร.ม.)' },
                      { key: 'totalWallVolume', label: 'ปริมาตรผนังรวม (ลบ.ม.)' },
                      { key: 'parkingArea', label: 'พื้นที่จอดรถ (ตร.ม.)' },
                    ].map(field => (
                      <div key={field.key} className="flex justify-between items-center border-b border-gray-200 pb-1">
                        <span className="text-gray-600 font-bold">{field.label}:</span>
                        <input 
                          type="number" 
                          value={projectInfo[field.key] || ''} 
                          onChange={e => handleProjectInfoChange(field.key, e.target.value === '' ? '' : Number(e.target.value))} 
                          className="w-20 text-right border border-gray-300 rounded px-1 py-0.5 outline-none focus:border-blue-500 font-bold bg-white" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Dictionary */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-bold text-blue-800 mb-3">📖 พจนานุกรมคำค้นหา (Keyword Dictionary) ตัวอย่าง</h3>
                  <div className="grid grid-cols-3 gap-4 text-[11px]">
                    <ul className="list-disc pl-4 text-gray-700 space-y-1">
                        <li><b className="text-blue-700">ลวดผูกเหล็ก</b> = พท.ใช้สอย * 0.22</li>
                        <li><b className="text-blue-700">ตะปู</b> = พท.ใช้สอย * 0.15</li>
                        <li><b className="text-blue-700">กระเบื้องซีแพค</b> = พท.หลังคา * 11</li>
                    </ul>
                    <ul className="list-disc pl-4 text-gray-700 space-y-1">
                        <li><b className="text-blue-700">บล็อกแอร์</b> = ห้องนอน + 1</li>
                        <li><b className="text-blue-700">ดาวน์ไลท์</b> = ห้องนอน * 4</li>
                        <li><b className="text-blue-700">ประตูภายใน</b> = จำนวนห้องนอน</li>
                    </ul>
                    <ul className="list-disc pl-4 text-gray-700 space-y-1">
                        <li><b className="text-blue-700">ปูนก่อ/ฉาบ</b> = คำนวณจากปริมาตร/พื้นที่ผนัง</li>
                        <li><b className="text-blue-700">สีทาภายใน</b> = พื้นที่ผนังภายใน</li>
                        <li><b className="text-blue-700">DB20/DB16</b> = คาน * 6 * ค่าสัมประสิทธิ์</li>
                    </ul>
                  </div>
              </div>
              </div>
            </div>
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
          {categories.map((cat, index) => (
            <CategoryDetail
              key={cat.id}
              cat={cat}
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
            />
          ))}

        </div>
      </main>
    </div>
  );
}
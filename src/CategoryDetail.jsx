import React, { useState } from 'react';
import DocumentHeader from './DocumentHeader';

export default function CategoryDetail({
  cat,
  index,
  activeTab,
  categoriesLength,
  projectInfo,
  getCategoryTotals,
  masterBom,
  formatNum,
  handleRemoveItem,
  handleItemChange,
  applyBomToItem,
  handleAddItem,
  handleMoveItem
}) {
  const isVisible = activeTab === cat.id;
  const totals = getCategoryTotals(cat);

  const recommendedItems = masterBom.filter(b => String(b.catId) === String(cat.id));
  const otherBomItems = masterBom.filter(b => !recommendedItems.includes(b));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);

  const filteredItems = cat.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let isEmpty = false;
    if (hideEmpty) {
      const qtyNum = item.qty === '-' ? 0 : Number(item.qty) || 0;
      isEmpty = qtyNum === 0;
    }
    
    return matchesSearch && !isEmpty;
  });

  return (
    <div 
      className={`a4-container w-[210mm] bg-white border border-blue-custom shadow-xl relative text-[12px] mx-auto page-break ${isVisible ? 'flex flex-col' : 'hidden'} print:block`}
    >
      <DocumentHeader title={`หมวดที่ ${cat.id} - ${cat.name}`} pageIndex={index + 2} totalPages={categoriesLength + 1} projectInfo={projectInfo} />

      <div className="flex-grow p-4">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-3 no-print">
          <div className="flex items-center gap-2 w-1/2">
            <span className="text-gray-500">🔍</span>
            <input 
              type="text" 
              placeholder="ค้นหารายการวัสดุ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-[13px] w-full focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>
          <button 
            onClick={() => setHideEmpty(!hideEmpty)}
            className={`px-3 py-1.5 text-[12px] font-bold rounded flex items-center gap-1.5 border transition-colors ${hideEmpty ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-inner' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            {hideEmpty ? '👁️ โชว์ทั้งหมด' : '👁️‍🗨️ ซ่อนรายการ 0'}
          </button>
        </div>

        <table className="w-full text-left border-collapse table-fixed border border-blue-custom">
          <thead className="sticky top-0 z-10 shadow-sm bg-blue-50">
            <tr className="bg-blue-light text-center">
              <th rowSpan="2" className="py-1.5 px-1 border border-blue-custom text-[12px] font-bold text-black w-[5%]">No.</th>
              <th rowSpan="2" className="py-1.5 px-1 border border-blue-custom text-[12px] font-bold text-black w-[45%]">รายการ</th>
              <th rowSpan="2" className="py-1.5 px-1 border border-blue-custom text-[12px] font-bold text-black w-[7%]">จำนวน</th>
              <th rowSpan="2" className="py-1.5 px-1 border border-blue-custom text-[12px] font-bold text-black w-[7%]">หน่วย</th>
              <th colSpan="2" className="py-1.5 px-1 border border-blue-custom text-[12px] font-bold text-black w-[18%]">ค่าวัสดุ</th>
              <th colSpan="2" className="py-1.5 px-1 border border-blue-custom text-[12px] font-bold text-black w-[18%]">ค่าแรงงาน</th>
            </tr>
            <tr className="bg-blue-light text-center">
              <th className="py-1 px-1 border border-blue-custom text-[11px] font-bold text-black">ราคา/หน่วย</th>
              <th className="py-1 px-1 border border-blue-custom text-[11px] font-bold text-black">จำนวนเงิน</th>
              <th className="py-1 px-1 border border-blue-custom text-[11px] font-bold text-black">ราคา/หน่วย</th>
              <th className="py-1 px-1 border border-blue-custom text-[11px] font-bold text-black">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan="8" className="border border-blue-custom h-1 bg-gray-50"></td></tr>
            
            {filteredItems.map((item, itemIndex) => {
              const qtyNum = item.qty === '-' ? 0 : Number(item.qty) || 0;
              const matTotal = qtyNum * (Number(item.matPrice) || 0);
              const laborTotal = qtyNum * (Number(item.laborPrice) || 0);
              
              return (
                <tr key={item.id} className="group hover:bg-blue-50/50">
                  <td className="py-1.5 px-1 border border-blue-custom text-center font-bold text-gray-700 relative">
                    <button onClick={() => handleRemoveItem(cat.id, item.id)} className="absolute -left-5 top-1.5 text-red-500 hover:text-white bg-red-100 hover:bg-red-500 rounded px-1 text-[10px] opacity-0 group-hover:opacity-100 transition-all no-print" title="ลบรายการนี้">✕</button>
                    {item.displayNumber}
                  </td>
                  <td className="py-1.5 px-1 border border-blue-custom relative">
                    <div className="flex items-center gap-1">
                      <input type="text" value={item.name} onChange={(e) => handleItemChange(cat.id, item.id, 'name', e.target.value)} className="clean-input font-bold text-gray-900 w-full" placeholder="ระบุรายการ..." />

                      <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                        {masterBom.length > 0 && (
                          <div className="relative group/bom" title={`ดึงข้อมูลแนะนำสำหรับข้อ ${item.id}`}>
                            <button className="text-white bg-blue-600 hover:bg-blue-700 rounded-l-md px-1.5 py-0.5 text-[10px] font-bold shadow-sm flex items-center h-[22px]">
                              ⚡
                            </button>
                            <select 
                              onChange={(e) => { applyBomToItem(cat.id, item.id, e.target.value); e.target.value = ''; }} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            >
                              <option value="" disabled>+ เลือกจากฐาน BOM...</option>
                              {recommendedItems.length > 0 && (
                                <optgroup label={`▶ แนะนำสำหรับหมวดนี้`}>
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
                        <div className="flex flex-col">
                          <button onClick={() => handleMoveItem(cat.id, itemIndex, -1)} disabled={itemIndex === 0} className="text-white bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed h-[11px] w-5 flex items-center justify-center rounded-tr-md" title="ย้ายขึ้น"><svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg></button>
                          <button onClick={() => handleMoveItem(cat.id, itemIndex, 1)} disabled={itemIndex === cat.items.length - 1} className="text-white bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed h-[11px] w-5 flex items-center justify-center rounded-br-md" title="ย้ายลง"><svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-1.5 px-1 border border-blue-custom text-center">
                    <input type="text" value={item.qty} onChange={(e) => handleItemChange(cat.id, item.id, 'qty', e.target.value)} className={`clean-input text-center font-extrabold ${item.qty === '-' ? 'text-gray-400' : 'text-blue-700'}`} />
                  </td>
                  <td className="py-1.5 px-1 border border-blue-custom text-center">
                    <input type="text" value={item.unit} onChange={(e) => handleItemChange(cat.id, item.id, 'unit', e.target.value)} className="clean-input text-center font-bold text-gray-800" />
                  </td>
                  <td className="py-1.5 px-1 border border-blue-custom text-right pr-1">
                    <input type="number" value={item.matPrice} onChange={(e) => handleItemChange(cat.id, item.id, 'matPrice', e.target.value)} className="clean-input text-right text-blue-700 font-bold" />
                  </td>
                  <td className="py-1.5 px-1 border border-blue-custom text-right pr-1 font-bold text-gray-800 bg-gray-50">{formatNum(matTotal)}</td>
                  <td className="py-1.5 px-1 border border-blue-custom text-right pr-1">
                    <input type="number" value={item.laborPrice} onChange={(e) => handleItemChange(cat.id, item.id, 'laborPrice', e.target.value)} className="clean-input text-right text-teal-700 font-bold" />
                  </td>
                  <td className="py-1.5 px-1 border border-blue-custom text-right pr-1 font-bold text-gray-800 bg-gray-50">{formatNum(laborTotal)}</td>
                </tr>
              );
            })}

            <tr className="no-print">
              <td colSpan="8" className="py-2 border border-blue-custom text-center bg-gray-50">
                <button onClick={() => handleAddItem(cat.id)} className="text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[11px] font-bold px-3 py-0.5 rounded transition-colors shadow-sm">
                  + เพิ่มรายการ
                </button>
              </td>
            </tr>
            
            <tr><td colSpan="8" className="border-x border-blue-custom border-b h-4"></td></tr>

          </tbody>
          <tfoot>
            <tr className="bg-blue-light border-2 border-blue-custom">
              <td colSpan="5" className="py-2 px-3 border border-blue-custom text-right text-[12px] font-extrabold text-black">รวมค่าวัสดุและค่าแรง หมวด {cat.id}</td>
              <td className="py-2 pr-1 border border-blue-custom text-right font-extrabold text-black">{formatNum(totals.material)}</td>
              <td className="py-2 border border-blue-custom bg-white"></td>
              <td className="py-2 pr-1 border border-blue-custom text-right font-extrabold text-black">{formatNum(totals.labor)}</td>
            </tr>
            <tr className="bg-gray-100 border-2 border-blue-custom">
              <td colSpan="7" className="py-2.5 px-3 border border-blue-custom text-right text-[13px] font-extrabold text-black">รวมเป็นเงินทั้งสิ้น หมวดที่ {cat.id} (Sub Total)</td>
              <td className="py-2.5 pr-1 border border-blue-custom text-right font-extrabold text-black text-[14px]">{formatNum(totals.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
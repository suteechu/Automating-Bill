import React from 'react';
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
  handleAddItem
}) {
  const isVisible = activeTab === cat.id;
  const totals = getCategoryTotals(cat);
  
  return (
    <div 
      className={`a4-container w-[210mm] bg-white border border-blue-custom shadow-xl relative text-[12px] mx-auto page-break ${isVisible ? 'flex flex-col' : 'hidden'} print:block`}
    >
      <DocumentHeader title={`หมวดที่ ${cat.id} - ${cat.name}`} pageIndex={index + 2} totalPages={categoriesLength + 1} projectInfo={projectInfo} />

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
}
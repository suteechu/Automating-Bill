import React, { useState } from 'react';

export default function MasterBom({
  masterBom,
  groupedMasterBom,
  addMasterBom,
  exportMasterBomToCSV,
  handleFileUpload,
  clearMasterBom,
  removeMasterBom,
  handleMasterBomChange
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBom = searchTerm
    ? masterBom.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.catId || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    : masterBom;

  const displayGroupedBom = searchTerm ? filteredBom.reduce((acc, item) => {
    const cat = item.catId ? item.catId.toString().trim() : '';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {}) : groupedMasterBom;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white border border-gray-300 shadow-xl p-6 text-[13px] flex flex-col no-print print:hidden font-smk mx-auto">
      <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Master BOM Database</h2>
          <p className="text-gray-600 text-[11px] mt-0.5 font-bold">จัดการฐานข้อมูลราคาวัสดุและแรงงาน (อิงตามไฟล์ DATA BOM.csv)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="ค้นหารายการ หรือหมวด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500 shadow-sm w-48 font-bold"
            />
          </div>
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
            {filteredBom.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-500 border border-blue-custom bg-gray-50 font-bold">
                  {searchTerm ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีข้อมูล BOM ในระบบ กรุณาอัปโหลดไฟล์ CSV'}
                </td>
              </tr>
            )}
            {Object.keys(displayGroupedBom).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})).map(catKey => (
              <React.Fragment key={catKey}>
                <tr className="bg-gray-100 border-y-2 border-blue-custom">
                  <td colSpan="6" className="p-1.5 px-3 text-left font-extrabold text-blue-800 text-[13px]">
                    {catKey === '' ? '▶ รายการที่ไม่ได้ระบุหมวดหมู่' : `▶ หมวดงานที่ ${catKey}`}
                  </td>
                </tr>
                {displayGroupedBom[catKey].map((item) => (
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
            บันทึกอัตโนมัติ ({searchTerm ? `${filteredBom.length} / ${masterBom.length}` : masterBom.length} รายการ)
          </span>
      </div>
    </div>
  );
}
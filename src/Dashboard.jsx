import React from 'react';

export default function Dashboard({
  projectInfo,
  handleProjectInfoChange,
  resetProject,
  importProjectFromJSON,
  exportProjectToJSON,
  formatNum,
  grandTotal,
  costPerSqm,
  profitMargin,
  overheadProfit,
  matPercent,
  laborPercent,
  grandTotalMaterial,
  grandTotalLabor,
  sortedCategories,
  subTotal,
  maxCategoryTotal
}) {
  return (
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
  );
}
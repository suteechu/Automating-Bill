import React from 'react';
import DocumentHeader from './DocumentHeader';

export default function Summary({
  activeTab,
  setActiveTab,
  categoriesLength,
  summaryRows,
  grandTotalMaterial,
  grandTotalLabor,
  subTotal,
  profitMargin,
  overheadProfit,
  discountRounding,
  setDiscountRounding,
  grandTotal,
  formatNum,
  THBText,
  projectInfo
}) {
  // เปลี่ยน print:flex เป็น print:block เพื่อป้องกันบั๊ก Chrome พริ้นท์หน้าเดียว
  return (
    <div className={`a4-container w-[210mm] bg-white border border-blue-custom shadow-xl relative text-[13px] mx-auto ${activeTab === 'summary' ? 'flex flex-col' : 'hidden print:block'}`}>
      <DocumentHeader title="SUMMARY BOQ" pageIndex={1} totalPages={categoriesLength + 1} projectInfo={projectInfo} />

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
  );
}
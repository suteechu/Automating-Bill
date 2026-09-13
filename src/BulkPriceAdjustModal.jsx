import React, { useState, useEffect } from 'react';

export default function BulkPriceAdjustModal({ isOpen, onClose, onSubmit, categories, activeTab, saveAsDefaultTemplate }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [targetCatId, setTargetCatId] = useState('all');
  const [percentage, setPercentage] = useState(10);
  const [priceTypes, setPriceTypes] = useState('both');

  // Pre-select the active category when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setInternalIsOpen(true);
        const defaultCat = (activeTab && !['dashboard', 'summary', 'bom', 'recheck'].includes(activeTab)) ? activeTab : 'all';
        setTargetCatId(defaultCat);
      }, 10); 
    } else {
      setTimeout(() => setInternalIsOpen(false), 10);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(targetCatId, parseFloat(percentage || 0), priceTypes);
    onClose();
  };

  const handleSaveTemplateClick = () => {
    if (saveAsDefaultTemplate) {
      saveAsDefaultTemplate();
    }
  };

  let currentTotal = 0;
  let newTotal = 0;

  if (categories && categories.length) {
    categories.forEach(cat => {
      const isTargetCat = targetCatId === 'all' || String(targetCatId) === String(cat.id);
      
      cat.items.forEach(item => {
        const qty = item.qty === '-' ? 0 : Number(item.qty) || 0;
        const currentMat = Number(item.matPrice) || 0;
        const currentLabor = Number(item.laborPrice) || 0;
        
        currentTotal += qty * (currentMat + currentLabor);
        
        if (isTargetCat) {
           const factor = 1 + (parseFloat(percentage || 0) / 100);
           const newMat = priceTypes === 'mat' || priceTypes === 'both' ? currentMat * factor : currentMat;
           const newLabor = priceTypes === 'labor' || priceTypes === 'both' ? currentLabor * factor : currentLabor;
           newTotal += qty * (newMat + newLabor);
        } else {
           newTotal += qty * (currentMat + currentLabor);
        }
      });
    });
  }

  const diff = newTotal - currentTotal;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] transition-opacity duration-300 ease-in-out ${internalIsOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${internalIsOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-200 flex items-center gap-3">
          <span className="text-3xl">💸</span> ปรับราคาแบบกลุ่ม
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
              หมวดงานที่ต้องการปรับ
            </label>
            <select
              id="category-select"
              value={targetCatId}
              onChange={(e) => setTargetCatId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-md shadow-sm"
            >
              <option value="all">ปรับทุกหมวด</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.id}. {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="percentage-input" className="block text-sm font-medium text-gray-700 mb-1">
              เปอร์เซ็นต์ที่ปรับ (%)
            </label>
            <input
              type="number"
              id="percentage-input"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="เช่น 10 หรือ -5"
              className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">ใส่ค่าบวกเพื่อเพิ่มราคา, ค่าลบเพื่อลดราคา</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทราคาที่ต้องการปรับ
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'mat', label: 'ราคาของ' },
                { value: 'labor', label: 'ค่าแรง' },
                { value: 'both', label: 'ทั้งสองอย่าง' },
              ].map(option => (
              <label key={option.value} className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-colors ${priceTypes === option.value ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="priceType" value={option.value} checked={priceTypes === option.value} onChange={(e) => setPriceTypes(e.target.value)} className="hidden" />
                <span className="text-sm font-bold">{option.label}</span>
              </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
            <h3 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">📊 พรีวิวยอดรวมหลังปรับราคา</h3>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500 font-medium">ยอดรวมปัจจุบัน:</span>
              <span className="font-bold text-gray-800">{currentTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ฿</span>
            </div>
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-700 font-bold">ยอดรวมใหม่:</span>
              <span className={`font-extrabold ${newTotal > currentTotal ? 'text-red-600' : newTotal < currentTotal ? 'text-green-600' : 'text-blue-600'}`}>
                {newTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ฿
              </span>
            </div>
            {diff !== 0 && (
              <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500">ส่วนต่าง:</span>
                <span className={`font-bold ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {diff > 0 ? '+' : '-'}{Math.abs(diff).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ฿
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              {saveAsDefaultTemplate && (
                <button type="button" onClick={handleSaveTemplateClick} className="text-xs text-gray-500 font-bold hover:text-blue-600 transition-colors flex items-center gap-1.5" title="บันทึกสถานะโปรเจกต์ปัจจุบันเป็นเทมเพลตสำหรับเริ่มโปรเจกต์ใหม่">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  บันทึกเป็นเทมเพลต
                </button>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="bg-white text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm">
                ยกเลิก
              </button>
              <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                ยืนยันปรับราคา
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { getShortCatName } from './utils';

export default function Sidebar({
  activeTab,
  setActiveTab,
  categories,
  updateAllFromBom,
  syncGoogleSheet,
  isSyncing,
  handlePrint
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`${isOpen ? 'w-[260px]' : 'w-[64px]'} bg-white border-r border-gray-300 shadow-xl flex flex-col sticky top-0 h-screen no-print z-50 shrink-0 transition-all duration-300 overflow-hidden`}>
      <div className={`p-4 border-b border-gray-200 bg-blue-600 text-white flex items-center ${isOpen ? 'justify-between' : 'justify-center'} gap-3 min-h-[64px]`}>
        {isOpen ? (
          <>
            <div className="flex items-center gap-3">
              <div className="bg-white text-blue-600 w-8 h-8 rounded flex items-center justify-center font-bold text-lg shadow shrink-0">K</div>
              <div className="font-bold leading-tight tracking-wide whitespace-nowrap">
                Suteechu To BIM<br/><span className="text-xs text-blue-200 font-sans font-normal">Automating</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white shrink-0" title="พับเมนู">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
          </>
        ) : (
          <button onClick={() => setIsOpen(true)} className="bg-white text-blue-600 w-8 h-8 rounded flex items-center justify-center font-bold text-lg shadow shrink-0 hover:bg-gray-100" title="กางเมนู">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 no-scrollbar">
        <button 
          onClick={() => { setActiveTab('dashboard'); if (!isOpen) setIsOpen(true); }} 
          className={`text-left ${isOpen ? 'px-3' : 'px-0 justify-center'} py-2 text-[14px] rounded font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          title="ข้อมูลโครงการ"
        >
          <span className="shrink-0">📊</span> {isOpen && <span className="whitespace-nowrap">ข้อมูลโครงการ</span>}
        </button>
        
        <button 
          onClick={() => { setActiveTab('recheck'); if (!isOpen) setIsOpen(true); }} 
          className={`text-left ${isOpen ? 'px-3' : 'px-0 justify-center'} py-2 text-[14px] rounded font-bold transition-all flex items-center gap-2 ${activeTab === 'recheck' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          title="รีเช็คสูตร / ตัวแปร"
        >
          <span className="shrink-0">🔍</span> {isOpen && <span className="whitespace-nowrap">รีเช็คสูตร / ตัวแปร</span>}
        </button>

        <button 
          onClick={() => { setActiveTab('summary'); if (!isOpen) setIsOpen(true); }} 
          className={`text-left ${isOpen ? 'px-3' : 'px-0 justify-center'} py-2 text-[14px] rounded font-bold transition-all flex items-center gap-2 ${activeTab === 'summary' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          title="หน้าสรุป"
        >
          <span className="shrink-0">📄</span> {isOpen && <span className="whitespace-nowrap">หน้าสรุป</span>}
        </button>
        
        <div className="my-2 border-b border-gray-200"></div>
        
        {isOpen && (
          <div className="text-[11px] font-extrabold text-gray-400 px-2 mb-1 uppercase tracking-wider whitespace-nowrap">
            หมวดงานก่อสร้าง
          </div>
        )}
        
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => { setActiveTab(cat.id); if (!isOpen) setIsOpen(true); }} 
            className={`text-left ${isOpen ? 'px-3' : 'px-0 justify-center'} py-1.5 text-[13px] rounded font-bold transition-all flex items-center ${activeTab === cat.id ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
            title={`หมวดที่ ${cat.id} - ${getShortCatName(cat.name)}`}
          >
            {isOpen ? (
              <>
                <span className={`${activeTab === cat.id ? 'text-blue-500' : 'text-gray-400'} mr-1 shrink-0`}>{cat.id}.</span>
                <span className="truncate">{getShortCatName(cat.name)}</span>
              </>
            ) : (
              <span className={activeTab === cat.id ? 'text-blue-600' : 'text-gray-600'}>{cat.id}</span>
            )}
          </button>
        ))}
        
        <div className="my-2 border-b border-gray-200"></div>
        
        <button 
          onClick={() => { setActiveTab('bom'); if (!isOpen) setIsOpen(true); }} 
          className={`text-left ${isOpen ? 'px-3' : 'px-0 justify-center'} py-2 text-[14px] rounded font-bold transition-all flex items-center gap-2 ${activeTab === 'bom' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          title="จัดการ BOM"
        >
          <span className="shrink-0">⚙️</span> {isOpen && <span className="whitespace-nowrap">จัดการ BOM</span>}
        </button>
      </div>

      <div className={`p-3 border-t border-gray-200 bg-gray-50 flex flex-col gap-2 ${isOpen ? '' : 'items-center'}`}>
        {isOpen ? (
          <>
            <div className="flex gap-2">
              <button onClick={updateAllFromBom} className="flex-1 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 py-1.5 px-2 rounded flex justify-center items-center gap-1 transition-all text-[11px] font-bold shadow-sm whitespace-nowrap" title="อัปเดตราคาทั้งหมด">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
                ดึงราคาใหม่
              </button>
              <button onClick={() => syncGoogleSheet(false)} disabled={isSyncing} className={`flex-1 border py-1.5 px-2 rounded flex justify-center items-center gap-1 transition-all text-[11px] font-bold shadow-sm whitespace-nowrap ${isSyncing ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'}`} title="ซิงค์ BOM จาก Google Sheets">
                {isSyncing ? <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>}
                ซิงค์ BOM
              </button>
            </div>
            <button onClick={handlePrint} className="w-full bg-gray-800 hover:bg-black text-white font-bold py-2 px-4 rounded shadow flex justify-center items-center gap-2 transition-all text-sm whitespace-nowrap">
              🖨️ พิมพ์ / ดาวน์โหลด PDF
            </button>
          </>
        ) : (
          <button onClick={handlePrint} className="w-10 h-10 bg-gray-800 hover:bg-black text-white font-bold rounded shadow flex justify-center items-center transition-all text-sm shrink-0" title="พิมพ์ / ดาวน์โหลด PDF">
            🖨️
          </button>
        )}
      </div>
    </aside>
  );
}
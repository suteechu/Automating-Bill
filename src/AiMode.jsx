import React, { useState } from 'react';

export default function AiMode({ projectInfo, categories, formatNum }) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('kid_bom_ai_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load AI history', e);
      return [];
    }
  });
  const [analysis, setAnalysis] = useState(null);

  const saveToHistory = () => {
    if (!projectInfo.area || projectInfo.area <= 0) {
      alert('กรุณาระบุพื้นที่ใช้สอย (ตร.ม.) ในหน้าข้อมูลโครงการก่อนให้ AI เรียนรู้');
      return;
    }
    
    // Calculate totals
    let totalMat = 0;
    let totalLab = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        const q = item.qty === '-' ? 0 : Number(item.qty) || 0;
        totalMat += q * (Number(item.matPrice) || 0);
        totalLab += q * (Number(item.laborPrice) || 0);
      });
    });
    
    const newEntry = {
      id: Date.now(),
      name: projectInfo.name || 'โปรเจกต์ไม่มีชื่อ',
      date: new Date().toISOString(),
      area: Number(projectInfo.area),
      bathrooms: Number(projectInfo.bathrooms) || 0,
      totalMat,
      totalLab,
      total: totalMat + totalLab
    };
    
    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    localStorage.setItem('kid_bom_ai_history', JSON.stringify(updatedHistory));
    alert('บันทึกข้อมูลเข้าสู่ AI Brain เรียบร้อยแล้ว!');
  };
  
  const clearHistory = () => {
    if (window.confirm('ต้องการล้างข้อมูลที่ AI เรียนรู้มาทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
      localStorage.removeItem('kid_bom_ai_history');
      setAnalysis(null);
    }
  };

  const analyzeData = () => {
    if (history.length === 0) {
      alert('AI ยังไม่มีข้อมูลโปรเจกต์เก่าให้เรียนรู้ กรุณาบันทึกโปรเจกต์ก่อน');
      return;
    }
    
    let sumArea = 0;
    let sumTotal = 0;
    let sumMat = 0;
    let sumLab = 0;
    
    history.forEach(h => {
      sumArea += h.area;
      sumTotal += h.total;
      sumMat += h.totalMat;
      sumLab += h.totalLab;
    });
    
    const avgCostPerSqm = sumTotal / sumArea;
    const matRatio = sumMat / sumTotal;
    const labRatio = sumLab / sumTotal;
    
    setAnalysis({
      avgCostPerSqm,
      matRatio,
      labRatio,
      projectCount: history.length
    });
  };

  return (
    <div className="transform scale-110 origin-top mt-4 mb-24 flex justify-center w-full">
      <div className="w-[210mm] bg-white rounded shadow-xl border border-gray-300 p-6 text-gray-800 no-print print:hidden font-smk">
        <div className="border-b border-gray-300 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-indigo-700 flex items-center gap-2">
              <span className="text-2xl">🤖</span> AI Learning Mode
            </h2>
            <p className="text-gray-600 text-[12px] mt-0.5 font-bold">โหมดจำลอง AI เรียนรู้จากประวัติโปรเจกต์ของคุณเพื่อช่วยประเมินราคาอัจฉริยะ</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200 shadow-sm">
            AI Brain Level: {history.length > 5 ? '🧠 อัจฉริยะ' : history.length > 0 ? '📝 กำลังเรียนรู้' : '👶 เริ่มต้น'} ({history.length} โปรเจกต์)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200">
            <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
              📥 สอน AI จากโปรเจกต์ปัจจุบัน
            </h3>
            <p className="text-xs text-indigo-700 mb-4 h-10">บันทึกข้อมูล BOQ ของโปรเจกต์ปัจจุบัน (พื้นที่, จำนวนห้อง, และราคาวัสดุ/ค่าแรงรวม) ลงในฐานข้อมูลส่วนตัวให้ AI จดจำ</p>
            <button onClick={saveToHistory} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow transition-all flex justify-center items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              บันทึกข้อมูลให้ AI เรียนรู้
            </button>
          </div>
          
          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
            <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
              💡 ให้ AI วิเคราะห์ข้อมูล
            </h3>
            <p className="text-xs text-emerald-700 mb-4 h-10">ประมวลผลข้อมูลจากทุกโปรเจกต์ที่คุณเคยสอน เพื่อหาสถิติ ค่าเฉลี่ย และแนวโน้มราคา</p>
            <button onClick={analyzeData} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow transition-all flex justify-center items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              วิเคราะห์ (Analyze)
            </button>
          </div>
        </div>

        {analysis && (
          <div className="mb-6 bg-white border-2 border-indigo-400 rounded-xl p-5 shadow-lg relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">AI Insights</div>
            <h3 className="text-sm font-bold text-indigo-900 mb-4">ผลการวิเคราะห์จาก AI (สร้างจาก {analysis.projectCount} โปรเจกต์)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded border border-gray-200 p-3 text-center">
                <div className="text-[10px] text-gray-500 font-bold mb-1">ค่าก่อสร้างเฉลี่ย (บาท/ตร.ม.)</div>
                <div className="text-xl font-extrabold text-indigo-700">{formatNum(analysis.avgCostPerSqm)}</div>
              </div>
              <div className="bg-gray-50 rounded border border-gray-200 p-3 text-center">
                <div className="text-[10px] text-gray-500 font-bold mb-1">สัดส่วนค่าวัสดุ (%)</div>
                <div className="text-xl font-extrabold text-blue-600">{(analysis.matRatio * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-gray-50 rounded border border-gray-200 p-3 text-center">
                <div className="text-[10px] text-gray-500 font-bold mb-1">สัดส่วนค่าแรง (%)</div>
                <div className="text-xl font-extrabold text-orange-600">{(analysis.labRatio * 100).toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded text-xs font-bold text-indigo-800 flex items-start gap-2 shadow-sm">
              <span className="text-base mt-0.5">💬</span>
              <p>
                "จากข้อมูลสถิติ โปรเจกต์ปัจจุบันของคุณ (พื้นที่ {projectInfo.area || 0} ตร.ม.) 
                ควรมีราคากลางประมาณ <b>{formatNum((projectInfo.area || 0) * analysis.avgCostPerSqm)}</b> บาท 
                ลองใช้เครื่องมือ 'ทดสอบคำนวณปริมาณอัตโนมัติ' ควบคู่กับค่านี้เพื่อเช็คว่า BOQ ของคุณ Over/Under Budget หรือไม่!"
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              ประวัติที่ AI เรียนรู้
            </h3>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-[10px] text-red-500 hover:text-red-700 font-bold underline transition-colors">ล้างประวัติทั้งหมด</button>
            )}
          </div>
          <div className="bg-gray-50 rounded border border-gray-200 max-h-40 overflow-y-auto no-scrollbar p-2 shadow-inner">
            {history.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-4">ยังไม่มีข้อมูลในประวัติ (AI ต้องการข้อมูลเพื่อเรียนรู้)</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-1">วันที่</th>
                    <th className="py-1">ชื่อ</th>
                    <th className="py-1 text-right">พื้นที่ (ตร.ม.)</th>
                    <th className="py-1 text-right">รวม (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 text-gray-700 font-medium hover:bg-white transition-colors">
                      <td className="py-1">{new Date(h.date).toLocaleDateString('th-TH')}</td>
                      <td className="py-1 truncate max-w-[100px]" title={h.name}>{h.name}</td>
                      <td className="py-1 text-right">{h.area}</td>
                      <td className="py-1 text-right font-bold text-indigo-600">{formatNum(h.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

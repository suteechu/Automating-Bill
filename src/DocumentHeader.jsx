import React from 'react';

export default function DocumentHeader({ title, pageIndex, totalPages, projectInfo }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white font-smk relative z-10 border-b-2 border-blue-custom print:border-b-2">
      <div className="hidden print:block absolute -top-4 right-0 text-right text-[10px] text-gray-500 font-bold">
        วันที่พิมพ์: {dateStr} เวลา {timeStr} น. &nbsp;&nbsp;|&nbsp;&nbsp; แผ่นที่ {pageIndex} / {totalPages}
      </div>

      <div className="grid grid-cols-12 gap-2 p-3 text-[12px] leading-tight">
        <div className="col-span-6 grid grid-cols-[70px_1fr] gap-y-1">
          <div className="font-bold text-gray-700">PROJECT :</div>
          <div className="font-bold text-gray-900">{projectInfo.name || ''} {projectInfo.floors || ''}</div>
          <div className="font-bold text-gray-700">OWNER :</div>
          <div className="font-bold text-gray-900">{projectInfo.owner || ''}</div>
          <div className="font-bold text-gray-700">LOCATION :</div>
          <div className="font-bold text-gray-900">{projectInfo.location || ''}</div>
          <div className="font-bold text-gray-700">SUBJECT :</div>
          <div className="font-bold text-gray-900">{projectInfo.bedrooms || 0} ห้องนอน {projectInfo.bathrooms || 0} ห้องน้ำ ({projectInfo.area || 0} ตร.ม.)</div>
        </div>
        
        <div className="col-span-3 grid grid-cols-[85px_1fr] gap-y-1">
          <div className="font-bold text-gray-700">Doc No :</div>
          <div className="font-bold text-gray-900"></div>
          <div className="font-bold text-gray-700">Doc. Title :</div>
          <div className="font-bold text-gray-900">{title}</div>
          <div className="font-bold text-gray-700">ESTIMATED BY :</div>
          <div className="font-bold text-gray-900">{projectInfo.estimator || ''}</div>
        </div>

        <div className="col-span-3 grid grid-cols-[70px_1fr] gap-y-1">
          <div className="font-bold text-gray-700 text-left">Project No :</div>
          <div className="font-bold text-gray-900 text-left">{projectInfo.projectNo || ''}</div>
          <div className="font-bold text-gray-700 text-left">Date :</div>
          <div className="font-bold text-gray-900 text-left">{projectInfo.date || ''}</div>
          <div className="font-bold text-gray-700 text-left">Revision :</div>
          <div className="font-bold text-gray-900 text-left"></div>
        </div>
      </div>
    </div>
  );
}
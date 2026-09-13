import React from 'react';

const CoverPage = ({ projectInfo }) => {
  // ใช้ `h-screen` เพื่อให้ครอบคลุมเต็มหน้าจอ/หน้ากระดาษ
  // และใช้ flexbox เพื่อจัดองค์ประกอบให้อยู่ตรงกลางทั้งแนวตั้งและแนวนอน
  // เปลี่ยนเป็น justify-between เพื่อให้ footer อยู่ด้านล่างสุดของหน้าเสมอ
  return (
    <div className="w-full h-screen p-12 flex flex-col justify-center bg-white font-smk">
      {/* ส่วนหัว */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-3">
          ใบประมาณราคา (Bill of Quantities)
        </h1>
        <h2 className="text-3xl text-gray-600">{projectInfo.name || 'โครงการตัวอย่าง'}</h2>
      </header>

      {/* ส่วนข้อมูลโครงการ */}
      <main className="flex items-center justify-center">
        <div className="w-full max-w-3xl border-2 border-gray-400 rounded-lg p-10 shadow-lg">
          <h3 className="text-3xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-4 mb-8">
            ข้อมูลโครงการ
          </h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-xl">
            <strong className="font-semibold text-gray-600">ชื่อโครงการ:</strong>
            <span>{projectInfo.name || '-'}</span>

            <strong className="font-semibold text-gray-600">ประเภทอาคาร:</strong>
            <span>{projectInfo.floors || '-'}</span>

            <strong className="font-semibold text-gray-600">เจ้าของโครงการ:</strong>
            <span>{projectInfo.owner || '-'}</span>

            <strong className="font-semibold text-gray-600">สถานที่ก่อสร้าง:</strong>
            <span>{projectInfo.location || '-'}</span>
            
            <strong className="font-semibold text-gray-600">พื้นที่ใช้สอย:</strong>
            <span>{projectInfo.area ? `${projectInfo.area} ตร.ม.` : '-'}</span>

            <strong className="font-semibold text-gray-600">วันที่:</strong>
            <span>{projectInfo.date || new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </main>

      {/* ส่วนท้าย */}
      <footer className="text-center mt-12">
        <p className="text-lg text-gray-600">จัดทำโดย: {projectInfo.estimator || '....................................................'}</p>
        <p className="text-base text-gray-500 mt-2">เอกสารนี้จัดทำขึ้นสำหรับยื่นธนาคารเพื่อขอสินเชื่อ</p>
      </footer>
    </div>
  );
};

export default CoverPage;
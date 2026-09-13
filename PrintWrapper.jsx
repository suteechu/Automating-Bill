import React from 'react';
import CoverPage from './CoverPage';
// สมมติว่า 'BoqTable' คือคอมโพเนนต์ที่แสดงตาราง BOQ ของคุณ
// หากใช้ชื่ออื่น กรุณาเปลี่ยนตามโปรเจกต์ของคุณ
// import BoqTable from './BoqTable'; 

// สร้างคอมโพเนนต์ตัวอย่างสำหรับเนื้อหาหลัก ในกรณีที่ยังไม่มี
const BoqTable = ({ projectInfo }) => (
  <div className="w-full p-12 bg-white font-['Sarabun']">
    <h1 className="text-2xl font-bold mb-4">รายละเอียดใบประมาณราคา</h1>
    <p>โครงการ: {projectInfo.name}</p>
    <p>เนื้อหาส่วนนี้คือตาราง Bill of Quantities ของคุณ...</p>
  </div>
);

const PrintWrapper = React.forwardRef(({ projectInfo, categories }, ref) => {
  return (
    <div ref={ref}>
      {/* หน้าที่ 1: หน้าปก */}
      <div className="print-page"><CoverPage projectInfo={projectInfo} /></div>
      {/* หน้าที่ 2 เป็นต้นไป: เนื้อหาหลัก (ตาราง BOQ) */}
      <div className="print-page"><BoqTable projectInfo={projectInfo} categories={categories} /></div>
    </div>
  );
});

export default PrintWrapper;
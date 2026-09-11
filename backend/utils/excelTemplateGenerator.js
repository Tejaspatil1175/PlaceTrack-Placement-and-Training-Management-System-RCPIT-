const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { ALL_EXPECTED_HEADERS } = require('../config/excelColumnMap');

/**
 * Generate formatted Excel Workbook for Student Data Ingestion Template
 */
async function generateStudentTemplateWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PlaceTrack - RCPIT';
  workbook.lastModifiedBy = 'PlaceTrack TPO System';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Students', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  // Setup columns
  worksheet.columns = ALL_EXPECTED_HEADERS.map((header) => {
    let width = 16;
    if (header === 'Name' || header === 'Email' || header === 'Address') width = 28;
    if (header === 'PRN') width = 18;
    if (header.includes('_SGPA') || header.includes('_CREDITS') || header.includes('_BACKLOGS')) width = 20;
    return {
      header,
      key: header,
      width
    };
  });

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell, colNumber) => {
    const isBasic = colNumber <= 12;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isBasic ? 'FF1E3A8A' : 'FF0F766E' } // Deep Blue for Basic, Teal for Academic
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: false
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'medium', color: { argb: 'FF111827' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };
  });

  // Sample Demo Data Rows
  const sampleRows = [
    {
      PRN: '202101001',
      Name: 'Aarav Suresh Sharma',
      Email: 'aarav.sharma@rcpit.ac.in',
      Phone: '9876543210',
      DOB: '2003-04-12',
      Gender: 'Male',
      Category: 'OPEN',
      Branch: 'Computer',
      Division: 'A',
      AdmissionYear: 2021,
      CurrentSemester: 7,
      Address: 'RCPIT Campus, Shirpur',
      SEM1_SGPA: 8.50, SEM1_CREDITS: 20, SEM1_NEW_BACKLOGS: 0, SEM1_CLEARED_BACKLOGS: 0,
      SEM2_SGPA: 8.80, SEM2_CREDITS: 20, SEM2_NEW_BACKLOGS: 0, SEM2_CLEARED_BACKLOGS: 0,
      SEM3_SGPA: 8.20, SEM3_CREDITS: 22, SEM3_NEW_BACKLOGS: 0, SEM3_CLEARED_BACKLOGS: 0,
      SEM4_SGPA: 8.60, SEM4_CREDITS: 22, SEM4_NEW_BACKLOGS: 0, SEM4_CLEARED_BACKLOGS: 0,
      SEM5_SGPA: 9.10, SEM5_CREDITS: 22, SEM5_NEW_BACKLOGS: 0, SEM5_CLEARED_BACKLOGS: 0,
      SEM6_SGPA: 8.90, SEM6_CREDITS: 22, SEM6_NEW_BACKLOGS: 0, SEM6_CLEARED_BACKLOGS: 0,
      SEM7_SGPA: '', SEM7_CREDITS: '', SEM7_NEW_BACKLOGS: '', SEM7_CLEARED_BACKLOGS: '',
      SEM8_SGPA: '', SEM8_CREDITS: '', SEM8_NEW_BACKLOGS: '', SEM8_CLEARED_BACKLOGS: ''
    },
    {
      PRN: '202101002',
      Name: 'Priya Rajendra Patil',
      Email: 'priya.patil@rcpit.ac.in',
      Phone: '9823456789',
      DOB: '2003-08-25',
      Gender: 'Female',
      Category: 'OBC',
      Branch: 'IT',
      Division: 'B',
      AdmissionYear: 2021,
      CurrentSemester: 7,
      Address: 'Subhash Nagar, Shirpur',
      SEM1_SGPA: 7.60, SEM1_CREDITS: 20, SEM1_NEW_BACKLOGS: 1, SEM1_CLEARED_BACKLOGS: 0,
      SEM2_SGPA: 7.90, SEM2_CREDITS: 20, SEM2_NEW_BACKLOGS: 0, SEM2_CLEARED_BACKLOGS: 1,
      SEM3_SGPA: 8.10, SEM3_CREDITS: 22, SEM3_NEW_BACKLOGS: 0, SEM3_CLEARED_BACKLOGS: 0,
      SEM4_SGPA: 8.40, SEM4_CREDITS: 22, SEM4_NEW_BACKLOGS: 0, SEM4_CLEARED_BACKLOGS: 0,
      SEM5_SGPA: 8.70, SEM5_CREDITS: 22, SEM5_NEW_BACKLOGS: 0, SEM5_CLEARED_BACKLOGS: 0,
      SEM6_SGPA: 8.50, SEM6_CREDITS: 22, SEM6_NEW_BACKLOGS: 0, SEM6_CLEARED_BACKLOGS: 0,
      SEM7_SGPA: '', SEM7_CREDITS: '', SEM7_NEW_BACKLOGS: '', SEM7_CLEARED_BACKLOGS: '',
      SEM8_SGPA: '', SEM8_CREDITS: '', SEM8_NEW_BACKLOGS: '', SEM8_CLEARED_BACKLOGS: ''
    }
  ];

  sampleRows.forEach((row) => {
    worksheet.addRow(row);
  });

  return workbook;
}

/**
 * Save template file locally
 */
async function saveTemplateFile(outputPath) {
  const targetPath = outputPath || path.join(__dirname, '..', 'templates', 'placetrack_student_template.xlsx');
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const workbook = await generateStudentTemplateWorkbook();
  await workbook.xlsx.writeFile(targetPath);
  return targetPath;
}

module.exports = {
  generateStudentTemplateWorkbook,
  saveTemplateFile
};

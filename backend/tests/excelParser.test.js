const { parseExcelBuffer } = require('../services/excelParser');
const { generateStudentTemplateWorkbook } = require('../utils/excelTemplateGenerator');

describe('Excel Parser Service', () => {
  it('should parse valid template workbook buffer into structured models', async () => {
    const workbook = await generateStudentTemplateWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();

    const result = await parseExcelBuffer(buffer);

    expect(result.headers.length).toBeGreaterThan(20);
    expect(result.rows.length).toBe(2);

    const firstRow = result.rows[0];
    expect(firstRow.userFields.prn).toBe('202101001');
    expect(firstRow.userFields.name).toBe('Aarav Suresh Sharma');
    expect(firstRow.userFields.email).toBe('aarav.sharma@rcpit.ac.in');
    expect(firstRow.studentFields.branch).toBe('Computer');
    expect(firstRow.studentFields.admissionYear).toBe(2021);
    expect(firstRow.semesterRecords.length).toBe(6); // Sem 1 to 6
    expect(firstRow.semesterRecords[0].sgpa).toBe(8.5);
    expect(firstRow.semesterRecords[0].credits).toBe(20);
  });
});

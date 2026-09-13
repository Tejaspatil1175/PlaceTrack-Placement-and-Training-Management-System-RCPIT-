const ExcelJS = require('exceljs');
const { EXCEL_COLUMN_MAP } = require('../config/excelColumnMap');
const { validateExcelHeaders } = require('./excelHeaderValidator');

/**
 * Parses an Excel buffer into structured data models using the name-based column mapping.
 * @param {Buffer} buffer - Excel spreadsheet buffer
 * @param {boolean} [allowDelta=false] - Whether to allow delta/partial column sets
 * @returns {Promise<{ headers: string[], rows: Array<{ rowNumber: number, userFields: object, studentFields: object, semesterRecords: object[], rawRow: object }> }>}
 */
const parseExcelBuffer = async (buffer, allowDelta = false) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel workbook contains no worksheets');
  }

  const headerRow = worksheet.getRow(1);
  const columnIndicesToHeaders = {};
  const actualHeaders = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const headerText = cell.value ? String(cell.value).trim() : '';
    if (headerText) {
      columnIndicesToHeaders[colNumber] = headerText;
      actualHeaders.push(headerText);
    }
  });

  const headerValidation = validateExcelHeaders(actualHeaders, allowDelta);
  if (!headerValidation.isValid) {
    const err = new Error(headerValidation.error || 'Invalid Excel headers');
    err.statusCode = 400;
    err.details = headerValidation;
    throw err;
  }

  const rows = [];
  const totalRows = worksheet.rowCount;

  for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    // Skip empty rows
    if (!row || !row.hasValues) continue;

    const rawRow = {};
    let hasAnyData = false;

    Object.entries(columnIndicesToHeaders).forEach(([colNum, header]) => {
      const cell = row.getCell(parseInt(colNum, 10));
      let cellValue = cell.value;

      // Handle Excel rich text or formulas
      if (cellValue && typeof cellValue === 'object') {
        if (cellValue.text) {
          cellValue = cellValue.text;
        } else if (cellValue.result !== undefined) {
          cellValue = cellValue.result;
        }
      }

      if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== '') {
        hasAnyData = true;
      }

      rawRow[header] = cellValue !== null && cellValue !== undefined ? cellValue : null;
    });

    if (!hasAnyData) continue;

    const userFields = {};
    const studentFields = {};
    const semMap = {};

    Object.entries(rawRow).forEach(([header, value]) => {
      const colDef = EXCEL_COLUMN_MAP[header];
      if (!colDef) return;

      let parsedValue = value;
      if (typeof parsedValue === 'string') {
        parsedValue = parsedValue.trim();
      }

      if (colDef.type === 'number' && parsedValue !== null && parsedValue !== '') {
        parsedValue = Number(parsedValue);
      } else if (colDef.type === 'decimal' && parsedValue !== null && parsedValue !== '') {
        parsedValue = parseFloat(parsedValue);
      } else if (colDef.type === 'date' && parsedValue) {
        if (parsedValue instanceof Date) {
          parsedValue = parsedValue.toISOString().split('T')[0];
        } else {
          parsedValue = String(parsedValue).trim();
        }
      }

      if (colDef.target === 'user') {
        userFields[colDef.field] = parsedValue;
      } else if (colDef.target === 'profile') {
        studentFields[colDef.field] = parsedValue;
      } else if (colDef.target === 'semester') {
        const sem = colDef.semNumber;
        if (!semMap[sem]) {
          semMap[sem] = {
            semesterNumber: sem,
            sgpa: null,
            credits: null,
            newBacklogs: 0,
            clearedBacklogs: 0
          };
        }
        semMap[sem][colDef.field] = parsedValue;
      }
    });

    // Filter semester records: only keep semesters where at least SGPA or credits is provided
    const semesterRecords = Object.values(semMap).filter(
      sem => sem.sgpa !== null && sem.sgpa !== '' && !isNaN(sem.sgpa)
    );

    rows.push({
      rowNumber,
      userFields,
      studentFields,
      semesterRecords,
      rawRow
    });
  }

  return {
    headers: actualHeaders,
    rows
  };
};

module.exports = {
  parseExcelBuffer
};

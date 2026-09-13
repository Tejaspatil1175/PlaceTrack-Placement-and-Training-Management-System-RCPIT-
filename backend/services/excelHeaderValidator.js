const { ALL_EXPECTED_HEADERS, BASIC_HEADERS, EXCEL_COLUMN_MAP } = require('../config/excelColumnMap');

/**
 * Validates that the uploaded sheet headers strictly match the frozen data contract.
 * @param {string[]} actualHeaders - Extracted header strings from the first row
 * @param {boolean} [allowDelta=false] - If true, allows partial/delta column sets (must at least contain PRN)
 * @returns {{ isValid: boolean, missingHeaders: string[], unknownHeaders: string[], error?: string }}
 */
const validateExcelHeaders = (actualHeaders, allowDelta = false) => {
  if (!Array.isArray(actualHeaders) || actualHeaders.length === 0) {
    return {
      isValid: false,
      missingHeaders: ALL_EXPECTED_HEADERS,
      unknownHeaders: [],
      error: 'Uploaded Excel sheet contains no header row'
    };
  }

  // Clean and trim headers
  const cleanedActualHeaders = actualHeaders
    .filter(h => h !== null && h !== undefined && String(h).trim() !== '')
    .map(h => String(h).trim());

  const actualHeaderSet = new Set(cleanedActualHeaders);

  // Check for unknown headers not defined in the frozen contract
  const unknownHeaders = cleanedActualHeaders.filter(header => !EXCEL_COLUMN_MAP[header]);

  if (unknownHeaders.length > 0) {
    return {
      isValid: false,
      missingHeaders: [],
      unknownHeaders,
      error: `Uploaded Excel template contains unrecognized columns: [${unknownHeaders.join(', ')}]`
    };
  }

  if (allowDelta) {
    // In delta mode, PRN is required + at least one semester column
    if (!actualHeaderSet.has('PRN')) {
      return {
        isValid: false,
        missingHeaders: ['PRN'],
        unknownHeaders: [],
        error: 'Delta update sheet must contain at least the PRN column'
      };
    }

    const hasAtLeastOneUpdateCol = cleanedActualHeaders.some(h => h !== 'PRN');
    if (!hasAtLeastOneUpdateCol) {
      return {
        isValid: false,
        missingHeaders: [],
        unknownHeaders: [],
        error: 'Delta update sheet must contain at least one semester or data column to update'
      };
    }

    return {
      isValid: true,
      missingHeaders: [],
      unknownHeaders: []
    };
  }

  // Full bulk upload contract validation: All basic headers + all semester headers must be present
  const missingHeaders = ALL_EXPECTED_HEADERS.filter(header => !actualHeaderSet.has(header));

  if (missingHeaders.length > 0) {
    return {
      isValid: false,
      missingHeaders,
      unknownHeaders: [],
      error: `Uploaded Excel template is missing required columns: [${missingHeaders.join(', ')}]`
    };
  }

  return {
    isValid: true,
    missingHeaders: [],
    unknownHeaders: []
  };
};

module.exports = {
  validateExcelHeaders
};

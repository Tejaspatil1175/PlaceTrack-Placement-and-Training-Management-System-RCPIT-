const { validateExcelHeaders } = require('../services/excelHeaderValidator');
const { ALL_EXPECTED_HEADERS } = require('../config/excelColumnMap');

describe('Excel Header Validator Service', () => {
  it('should validate exact contract headers successfully', () => {
    const result = validateExcelHeaders(ALL_EXPECTED_HEADERS);
    expect(result.isValid).toBe(true);
    expect(result.missingHeaders.length).toBe(0);
    expect(result.unknownHeaders.length).toBe(0);
  });

  it('should reject missing required columns', () => {
    const partialHeaders = ALL_EXPECTED_HEADERS.filter(h => h !== 'PRN' && h !== 'SEM1_SGPA');
    const result = validateExcelHeaders(partialHeaders);

    expect(result.isValid).toBe(false);
    expect(result.missingHeaders).toContain('PRN');
    expect(result.missingHeaders).toContain('SEM1_SGPA');
    expect(result.error).toContain('missing required columns');
  });

  it('should reject unrecognized columns', () => {
    const corruptedHeaders = [...ALL_EXPECTED_HEADERS, 'INVALID_EXTRA_COLUMN', 'RANDOM_FIELD'];
    const result = validateExcelHeaders(corruptedHeaders);

    expect(result.isValid).toBe(false);
    expect(result.unknownHeaders).toEqual(['INVALID_EXTRA_COLUMN', 'RANDOM_FIELD']);
    expect(result.error).toContain('unrecognized columns');
  });

  it('should support delta upload validation when allowDelta is true', () => {
    const deltaHeaders = ['PRN', 'SEM5_SGPA', 'SEM5_CREDITS', 'SEM5_NEW_BACKLOGS', 'SEM5_CLEARED_BACKLOGS'];
    const result = validateExcelHeaders(deltaHeaders, true);

    expect(result.isValid).toBe(true);
    expect(result.missingHeaders.length).toBe(0);
  });

  it('should reject delta upload if PRN is missing', () => {
    const deltaHeaders = ['SEM5_SGPA', 'SEM5_CREDITS'];
    const result = validateExcelHeaders(deltaHeaders, true);

    expect(result.isValid).toBe(false);
    expect(result.missingHeaders).toContain('PRN');
  });
});

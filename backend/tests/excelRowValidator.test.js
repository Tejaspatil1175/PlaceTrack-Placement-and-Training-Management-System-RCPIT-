const { validateStudentRow } = require('../validators/excelRowValidator');

describe('Excel Row Validator', () => {
  it('should pass on valid student row', () => {
    const validRow = {
      rowNumber: 2,
      userFields: {
        prn: '202101001',
        name: 'Aarav Sharma',
        email: 'aarav@rcpit.ac.in',
        gender: 'Male'
      },
      studentFields: {
        branch: 'Computer',
        currentSemester: 6,
        admissionYear: 2021
      },
      semesterRecords: [
        { semesterNumber: 1, sgpa: 8.5, credits: 20, newBacklogs: 0, clearedBacklogs: 0 },
        { semesterNumber: 2, sgpa: 9.0, credits: 20, newBacklogs: 0, clearedBacklogs: 0 }
      ]
    };

    const result = validateStudentRow(validRow);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should flag errors for invalid email, SGPA > 10, negative backlogs and invalid semester', () => {
    const invalidRow = {
      rowNumber: 5,
      userFields: {
        prn: '202101005',
        name: 'Test Student',
        email: 'not-an-email',
        gender: 'Alien'
      },
      studentFields: {
        branch: 'IT',
        currentSemester: 10,
        admissionYear: 1990
      },
      semesterRecords: [
        { semesterNumber: 1, sgpa: 11.5, credits: -5, newBacklogs: -1, clearedBacklogs: 0 }
      ]
    };

    const result = validateStudentRow(invalidRow);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Valid Email'))).toBe(true);
    expect(result.errors.some(e => e.includes('Gender must be'))).toBe(true);
    expect(result.errors.some(e => e.includes('CurrentSemester must be'))).toBe(true);
    expect(result.errors.some(e => e.includes('SGPA (11.5) must be between 0.00 and 10.00'))).toBe(true);
    expect(result.errors.some(e => e.includes('CREDITS (-5) cannot be negative'))).toBe(true);
    expect(result.errors.some(e => e.includes('NEW_BACKLOGS (-1) cannot be negative'))).toBe(true);
  });
});

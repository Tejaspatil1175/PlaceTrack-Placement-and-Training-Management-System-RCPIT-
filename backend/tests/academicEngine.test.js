const { computeCgpa, computeActiveBacklogs } = require('../services/academicEngine');

describe('Academic Engine Tests', () => {
  describe('computeCgpa', () => {
    test('returns 0.00 when semester records array is empty or undefined', () => {
      expect(computeCgpa([])).toBe(0.00);
      expect(computeCgpa(null)).toBe(0.00);
      expect(computeCgpa(undefined)).toBe(0.00);
    });

    test('calculates single semester CGPA correctly', () => {
      const records = [
        { semesterNumber: 1, sgpa: 8.50, credits: 20, newBacklogs: 0, clearedBacklogs: 0 }
      ];
      expect(computeCgpa(records)).toBe(8.50);
    });

    test('calculates credit-weighted CGPA correctly across multiple semesters', () => {
      const records = [
        { semesterNumber: 1, sgpa: 8.00, credits: 20, newBacklogs: 0, clearedBacklogs: 0 },
        { semesterNumber: 2, sgpa: 6.00, credits: 10, newBacklogs: 0, clearedBacklogs: 0 }
      ];
      // Weighted average: (8.00*20 + 6.00*10) / (20+10) = (160 + 60) / 30 = 220 / 30 = 7.3333 -> 7.33
      expect(computeCgpa(records)).toBe(7.33);
    });

    test('handles partial semester records (some blank or null)', () => {
      const records = [
        { semesterNumber: 1, sgpa: 9.00, credits: 20, newBacklogs: 0, clearedBacklogs: 0 },
        { semesterNumber: 2, sgpa: 8.00, credits: 20, newBacklogs: 0, clearedBacklogs: 0 },
        { semesterNumber: 3, sgpa: '', credits: '', newBacklogs: '', clearedBacklogs: '' },
        { semesterNumber: 4, sgpa: null, credits: null, newBacklogs: 0, clearedBacklogs: 0 }
      ];
      // Valid are Sem 1 and Sem 2: (9*20 + 8*20) / 40 = 340 / 40 = 8.50
      expect(computeCgpa(records)).toBe(8.50);
    });

    test('falls back to simple average when credits are 0 or omitted', () => {
      const records = [
        { semesterNumber: 1, sgpa: 8.00, credits: 0 },
        { semesterNumber: 2, sgpa: 9.00, credits: 0 }
      ];
      expect(computeCgpa(records)).toBe(8.50);
    });
  });

  describe('computeActiveBacklogs', () => {
    test('returns 0 for empty or undefined records', () => {
      expect(computeActiveBacklogs([])).toBe(0);
      expect(computeActiveBacklogs(null)).toBe(0);
      expect(computeActiveBacklogs(undefined)).toBe(0);
    });

    test('tracks newly opened backlogs', () => {
      const records = [
        { semesterNumber: 1, newBacklogs: 2, clearedBacklogs: 0 }
      ];
      expect(computeActiveBacklogs(records)).toBe(2);
    });

    test('tracks backlog clearing across semesters', () => {
      const records = [
        { semesterNumber: 1, newBacklogs: 2, clearedBacklogs: 0 }, // active: 2
        { semesterNumber: 2, newBacklogs: 1, clearedBacklogs: 1 }, // active: 2 + 1 - 1 = 2
        { semesterNumber: 3, newBacklogs: 0, clearedBacklogs: 2 }  // active: 2 + 0 - 2 = 0
      ];
      expect(computeActiveBacklogs(records)).toBe(0);
    });

    test('floors active backlogs at 0 (never negative)', () => {
      const records = [
        { semesterNumber: 1, newBacklogs: 1, clearedBacklogs: 0 }, // active: 1
        { semesterNumber: 2, newBacklogs: 0, clearedBacklogs: 3 }  // active: max(0, 1 - 3) = 0
      ];
      expect(computeActiveBacklogs(records)).toBe(0);
    });

    test('handles unordered semester records correctly', () => {
      const records = [
        { semesterNumber: 2, newBacklogs: 0, clearedBacklogs: 1 },
        { semesterNumber: 1, newBacklogs: 2, clearedBacklogs: 0 }
      ];
      // Sem 1 first -> 2 active, then Sem 2 -> clears 1 -> 1 active
      expect(computeActiveBacklogs(records)).toBe(1);
    });
  });
});

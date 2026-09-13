const { ingestStudentRows } = require('../services/bulkStudentService');
const { sequelize, User, StudentProfile, SemesterRecord, Department } = require('../models');
const { recalculateStudentAcademics } = require('../services/academicEngine');

jest.mock('../models', () => {
  const mockSequelize = {
    transaction: jest.fn(async (callback) => callback({})),
    Sequelize: {
      Op: {
        or: Symbol('or')
      }
    }
  };

  return {
    sequelize: mockSequelize,
    User: {
      findOne: jest.fn(),
      create: jest.fn()
    },
    StudentProfile: {
      create: jest.fn()
    },
    SemesterRecord: {
      findOne: jest.fn(),
      create: jest.fn()
    },
    Department: {
      findOne: jest.fn()
    }
  };
});

jest.mock('../services/academicEngine', () => ({
  recalculateStudentAcademics: jest.fn().mockResolvedValue({ cgpa: 8.5, activeBacklogs: 0 })
}));

describe('Bulk Student Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create student, profile, and semester records in a transaction', async () => {
    User.findOne.mockResolvedValue(null);
    Department.findOne.mockResolvedValue({ id: 1, name: 'Computer' });
    User.create.mockResolvedValue({ id: 10, prn: '202101001', name: 'Aarav Sharma', email: 'aarav@rcpit.ac.in' });
    StudentProfile.create.mockResolvedValue({ id: 25, userId: 10 });
    SemesterRecord.create.mockResolvedValue({ id: 50 });

    const rows = [
      {
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
          { semesterNumber: 1, sgpa: 8.5, credits: 20, newBacklogs: 0, clearedBacklogs: 0 }
        ]
      }
    ];

    const result = await ingestStudentRows(rows);

    expect(result.totalRows).toBe(1);
    expect(result.successCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        prn: '202101001',
        mustResetPassword: true,
        role: 'student'
      }),
      expect.anything()
    );
    expect(StudentProfile.create).toHaveBeenCalled();
    expect(SemesterRecord.create).toHaveBeenCalled();
    expect(recalculateStudentAcademics).toHaveBeenCalledWith(25, expect.anything());
  });

  it('should isolate failed row without stopping other valid rows', async () => {
    User.findOne
      .mockResolvedValueOnce({ id: 5, prn: '202101001' }) // duplicate PRN
      .mockResolvedValueOnce(null); // valid second row

    Department.findOne.mockResolvedValue({ id: 1, name: 'IT' });
    User.create.mockResolvedValue({ id: 11, prn: '202101002', name: 'Priya Patil', email: 'priya@rcpit.ac.in' });
    StudentProfile.create.mockResolvedValue({ id: 26, userId: 11 });

    const rows = [
      {
        rowNumber: 2,
        userFields: { prn: '202101001', name: 'Duplicate User', email: 'dup@rcpit.ac.in' },
        studentFields: { branch: 'IT', currentSemester: 6, admissionYear: 2021 },
        semesterRecords: []
      },
      {
        rowNumber: 3,
        userFields: { prn: '202101002', name: 'Priya Patil', email: 'priya@rcpit.ac.in' },
        studentFields: { branch: 'IT', currentSemester: 6, admissionYear: 2021 },
        semesterRecords: []
      }
    ];

    const result = await ingestStudentRows(rows);

    expect(result.totalRows).toBe(2);
    expect(result.successCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].message).toContain('already exists');
  });
});

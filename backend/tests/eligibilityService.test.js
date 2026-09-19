const { checkStudentEligibility, getEligibleStudentsForDrive } = require('../services/eligibilityService');
const { Drive, StudentProfile, User } = require('../models');

jest.mock('../models', () => ({
  Drive: {
    findByPk: jest.fn()
  },
  StudentProfile: {
    findAll: jest.fn()
  },
  User: {},
  Department: {}
}));

describe('Eligibility Matching Service', () => {
  const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
  const pastDate = new Date(Date.now() - 7 * 86400000).toISOString();

  const sampleDrive = {
    id: 1,
    companyName: 'Google',
    role: 'Software Engineer',
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    allowedBranches: ['Computer Engineering', 'Information Technology'],
    minSemester: 7,
    deadline: futureDate,
    status: 'UPCOMING'
  };

  describe('checkStudentEligibility (In-memory)', () => {
    it('should return eligible = true when all criteria are satisfied', () => {
      const student = {
        branch: 'Computer Engineering',
        cgpa: 8.5,
        activeBacklogs: 0,
        currentSemester: 7
      };

      const result = checkStudentEligibility(student, sampleDrive);
      expect(result.isEligible).toBe(true);
      expect(result.reasons.length).toBe(0);
    });

    it('should fail when CGPA is below minimum', () => {
      const student = {
        branch: 'Computer Engineering',
        cgpa: 7.2,
        activeBacklogs: 0,
        currentSemester: 7
      };

      const result = checkStudentEligibility(student, sampleDrive);
      expect(result.isEligible).toBe(false);
      expect(result.reasons[0]).toContain('below the required minimum');
    });

    it('should fail when student has active backlogs above limit', () => {
      const student = {
        branch: 'Computer Engineering',
        cgpa: 8.0,
        activeBacklogs: 1,
        currentSemester: 7
      };

      const result = checkStudentEligibility(student, sampleDrive);
      expect(result.isEligible).toBe(false);
      expect(result.reasons[0]).toContain('exceed maximum allowed');
    });

    it('should fail when student branch is not allowed', () => {
      const student = {
        branch: 'Mechanical Engineering',
        cgpa: 9.0,
        activeBacklogs: 0,
        currentSemester: 7
      };

      const result = checkStudentEligibility(student, sampleDrive);
      expect(result.isEligible).toBe(false);
      expect(result.reasons[0]).toContain("Branch 'Mechanical Engineering' is not eligible");
    });

    it('should fail when student semester is below minSemester', () => {
      const student = {
        branch: 'Computer Engineering',
        cgpa: 8.5,
        activeBacklogs: 0,
        currentSemester: 5
      };

      const result = checkStudentEligibility(student, sampleDrive);
      expect(result.isEligible).toBe(false);
      expect(result.reasons[0]).toContain('Current semester (5) is below required minimum (7)');
    });

    it('should fail when deadline has passed', () => {
      const expiredDrive = { ...sampleDrive, deadline: pastDate };
      const student = {
        branch: 'Computer Engineering',
        cgpa: 8.5,
        activeBacklogs: 0,
        currentSemester: 7
      };

      const result = checkStudentEligibility(student, expiredDrive);
      expect(result.isEligible).toBe(false);
      expect(result.reasons[0]).toContain('deadline has passed');
    });

    it('should fail when drive is cancelled', () => {
      const cancelledDrive = { ...sampleDrive, status: 'CANCELLED' };
      const student = {
        branch: 'Computer Engineering',
        cgpa: 8.5,
        activeBacklogs: 0,
        currentSemester: 7
      };

      const result = checkStudentEligibility(student, cancelledDrive);
      expect(result.isEligible).toBe(false);
      expect(result.reasons[0]).toContain('Drive is cancelled');
    });
  });

  describe('getEligibleStudentsForDrive (Database query)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw 404 error if drive does not exist', async () => {
      Drive.findByPk.mockResolvedValue(null);

      await expect(getEligibleStudentsForDrive(999)).rejects.toThrow('Placement drive not found');
    });

    it('should query StudentProfile with correct where clauses and return eligible students', async () => {
      Drive.findByPk.mockResolvedValue(sampleDrive);
      const mockStudents = [
        {
          id: 1,
          branch: 'Computer Engineering',
          cgpa: '8.80',
          activeBacklogs: 0,
          currentSemester: 7,
          user: { id: 10, prn: 'PRN001', name: 'Alice', email: 'alice@rcpit.ac.in' }
        }
      ];
      StudentProfile.findAll.mockResolvedValue(mockStudents);

      const result = await getEligibleStudentsForDrive(1);
      expect(result.drive).toEqual(sampleDrive);
      expect(result.eligibleStudents).toEqual(mockStudents);
      expect(StudentProfile.findAll).toHaveBeenCalledTimes(1);
    });
  });
});

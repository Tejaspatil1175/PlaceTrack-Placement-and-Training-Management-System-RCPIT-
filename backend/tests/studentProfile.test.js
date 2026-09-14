const request = require('supertest');

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn()
  },
  StudentProfile: {
    findOne: jest.fn(),
    findByPk: jest.fn()
  },
  SemesterRecord: {
    findOrCreate: jest.fn(),
    findAll: jest.fn()
  },
  Department: {
    findByPk: jest.fn()
  },
  ExcelUploadLog: {}
}));

jest.mock('../services/academicEngine', () => ({
  recalculateStudentAcademics: jest.fn().mockResolvedValue({
    studentId: 10,
    cgpa: 9.25,
    activeBacklogs: 0
  })
}));

const { app } = require('../server');
const { User, StudentProfile, SemesterRecord, Department } = require('../models');
const { generateToken } = require('../utils/jwt');
const { recalculateStudentAcademics } = require('../services/academicEngine');

describe('Student Profile & Academic Endpoints (Phase 8)', () => {
  let studentToken;
  let coordinatorToken;
  let tpoToken;

  beforeEach(() => {
    jest.clearAllMocks();
    studentToken = generateToken({ id: 10, role: 'student', prn: '202101001', email: 'aarav@rcpit.ac.in' });
    coordinatorToken = generateToken({ id: 2, role: 'coordinator', departmentId: 1 });
    tpoToken = generateToken({ id: 1, role: 'tpo' });
  });

  describe('GET /api/students/me (Step 47)', () => {
    it('should return student profile with cached academic fields', async () => {
      User.findByPk.mockResolvedValue({
        id: 10,
        prn: '202101001',
        name: 'Aarav Sharma',
        email: 'aarav@rcpit.ac.in',
        role: 'student',
        department: { id: 1, name: 'Computer' },
        studentProfile: {
          id: 5,
          branch: 'Computer',
          division: 'A',
          admissionYear: 2021,
          currentSemester: 6,
          cgpa: '8.75',
          activeBacklogs: 0,
          resumeUrl: 'https://res.cloudinary.com/placetrack/sample.pdf',
          skills: ['JavaScript', 'Node.js'],
          address: 'Shirpur Campus'
        }
      });

      const res = await request(app)
        .get('/api/students/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.prn).toBe('202101001');
      expect(res.body.data.profile.cgpa).toBe(8.75);
      expect(res.body.data.profile.skills).toContain('Node.js');
    });
  });

  describe('GET /api/students/me/academics (Step 48)', () => {
    it('should return full semester-wise academic records', async () => {
      User.findByPk.mockResolvedValue({ id: 10, role: 'student' });
      StudentProfile.findOne.mockResolvedValue({
        id: 5,
        userId: 10,
        branch: 'Computer',
        currentSemester: 6,
        cgpa: '8.75',
        activeBacklogs: 0,
        semesterRecords: [
          { id: 1, semesterNumber: 1, sgpa: '8.50', credits: 20, newBacklogs: 0, clearedBacklogs: 0 },
          { id: 2, semesterNumber: 2, sgpa: '9.00', credits: 20, newBacklogs: 0, clearedBacklogs: 0 }
        ]
      });

      const res = await request(app)
        .get('/api/students/me/academics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.semesterRecords.length).toBe(2);
      expect(res.body.data.semesterRecords[0].sgpa).toBe(8.5);
    });
  });

  describe('PUT /api/students/me (Step 49)', () => {
    it('should update non-academic fields like skills and address', async () => {
      const profileRecord = {
        id: 5,
        userId: 10,
        skills: ['React'],
        address: 'Old Address',
        resumeUrl: null,
        save: jest.fn().mockResolvedValue(true)
      };

      const userRecord = {
        id: 10,
        role: 'student',
        phone: '1234567890',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue(userRecord);
      StudentProfile.findOne.mockResolvedValue(profileRecord);

      const res = await request(app)
        .put('/api/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          skills: ['React', 'Node.js', 'MySQL'],
          address: 'New Hostels, Shirpur',
          phone: '9998887770'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(profileRecord.skills).toEqual(['React', 'Node.js', 'MySQL']);
      expect(profileRecord.address).toBe('New Hostels, Shirpur');
      expect(profileRecord.save).toHaveBeenCalled();
      expect(userRecord.save).toHaveBeenCalled();
    });
  });

  describe('POST /api/students/me/resume (Step 51)', () => {
    it('should upload resume buffer and link URL to profile', async () => {
      const profileRecord = {
        id: 5,
        userId: 10,
        resumeUrl: null,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue({ id: 10, role: 'student', prn: '202101001' });
      StudentProfile.findOne.mockResolvedValue(profileRecord);

      const fakePdfBuffer = Buffer.from('%PDF-1.4 fake pdf content');
      const res = await request(app)
        .post('/api/students/me/resume')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('resume', fakePdfBuffer, 'resume.pdf');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resumeUrl).toContain('.pdf');
      expect(profileRecord.resumeUrl).toBeDefined();
      expect(profileRecord.save).toHaveBeenCalled();
    });
  });

  describe('GET /api/departments/:id/students (Step 52)', () => {
    it('should allow coordinator to view students within their own department', async () => {
      User.findByPk.mockResolvedValue({ id: 2, role: 'coordinator', departmentId: 1 });
      Department.findByPk.mockResolvedValue({ id: 1, name: 'Computer Engineering' });
      User.findAll.mockResolvedValue([
        { id: 10, name: 'Aarav Sharma', role: 'student', departmentId: 1 }
      ]);

      const res = await request(app)
        .get('/api/departments/1/students')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.students.length).toBe(1);
    });

    it('should forbid coordinator from viewing students of another department', async () => {
      User.findByPk.mockResolvedValue({ id: 2, role: 'coordinator', departmentId: 1 });

      const res = await request(app)
        .get('/api/departments/2/students')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });
  });

  describe('PUT /api/students/:id/semester/:num (Step 53)', () => {
    it('should update semester record and re-calculate student CGPA and backlogs', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });

      const mockSemRecord = {
        id: 101,
        studentId: 5,
        semesterNumber: 4,
        sgpa: 8.0,
        credits: 22,
        newBacklogs: 0,
        clearedBacklogs: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      StudentProfile.findByPk.mockResolvedValue({
        id: 5,
        userId: 10,
        user: { id: 10, departmentId: 1 }
      });

      SemesterRecord.findOrCreate.mockResolvedValue([mockSemRecord, false]);

      const res = await request(app)
        .put('/api/students/5/semester/4')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          sgpa: 9.5,
          credits: 22,
          newBacklogs: 0,
          clearedBacklogs: 0
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockSemRecord.sgpa).toBe(9.5);
      expect(mockSemRecord.save).toHaveBeenCalled();
      expect(recalculateStudentAcademics).toHaveBeenCalledWith(5);
      expect(res.body.data.academics.cgpa).toBe(9.25);
    });
  });
});

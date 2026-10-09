const request = require('supertest');

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn()
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
  Application: {},
  Drive: {}
}));

const { app } = require('../server');
const { User, StudentProfile } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Admin Student Management Endpoints', () => {
  let tpoToken;
  let coordinatorToken;
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    coordinatorToken = generateToken({ id: 2, role: 'coordinator', departmentId: 1, email: 'coord@rcpit.ac.in' });
    studentToken = generateToken({ id: 10, role: 'student', prn: '202101001', email: 'student@rcpit.ac.in' });

    User.findByPk.mockImplementation((id) => {
      if (id === 1) return Promise.resolve({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
      if (id === 2) return Promise.resolve({ id: 2, role: 'coordinator', departmentId: 1, email: 'coord@rcpit.ac.in' });
      if (id === 10) return Promise.resolve({ id: 10, role: 'student', prn: '202101001', email: 'student@rcpit.ac.in' });
      return Promise.resolve(null);
    });
  });

  describe('GET /api/students', () => {
    it('should list students for TPO with search and filters', async () => {
      const mockStudents = [
        {
          id: 10,
          name: 'Rahul Sharma',
          email: 'rahul@rcpit.ac.in',
          prn: '202101001',
          department: { id: 1, name: 'Computer Engineering' },
          studentProfile: {
            id: 1,
            branch: 'Computer',
            admissionYear: 2021,
            currentSemester: 7,
            cgpa: 8.5,
            activeBacklogs: 0,
            applications: [{ id: 101, status: 'ACCEPTED' }]
          }
        }
      ];

      User.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockStudents
      });

      const res = await request(app)
        .get('/api/students?search=Rahul&branch=Computer')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.students).toHaveLength(1);
      expect(res.body.data.students[0].placementStatus).toBe('Placed');
    });

    it('should forbid student role from listing students', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should return full profile for TPO', async () => {
      User.findOne.mockResolvedValue({
        id: 10,
        name: 'Rahul Sharma',
        email: 'rahul@rcpit.ac.in',
        prn: '202101001',
        departmentId: 1,
        department: { id: 1, name: 'Computer' },
        studentProfile: {
          id: 1,
          branch: 'Computer',
          cgpa: 8.5,
          activeBacklogs: 0,
          semesterRecords: [],
          applications: []
        }
      });

      const res = await request(app)
        .get('/api/students/10')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Rahul Sharma');
    });

    it('should return 403 when coordinator accesses student of another department', async () => {
      User.findOne.mockResolvedValue({
        id: 20,
        departmentId: 2, // Coordinator is departmentId: 1
        studentProfile: {}
      });

      const res = await request(app)
        .get('/api/students/20')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should allow TPO to delete a student account', async () => {
      const mockDestroy = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue({
        id: 10,
        role: 'student',
        destroy: mockDestroy
      });

      const res = await request(app)
        .delete('/api/students/10')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should forbid coordinator from deleting student account', async () => {
      const res = await request(app)
        .delete('/api/students/10')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(403);
    });
  });
});

const request = require('supertest');

jest.mock('../models', () => ({
  Drive: {
    findByPk: jest.fn()
  },
  StudentProfile: {
    findAll: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  Department: {}
}));

const { app } = require('../server');
const { Drive, StudentProfile, User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('GET /api/drives/:id/eligible-students', () => {
  let tpoToken;
  let coordToken;
  let studentToken;

  const mockDrive = {
    id: 1,
    companyName: 'Persistent Systems',
    role: 'Software Developer',
    minCgpa: 7.0,
    maxActiveBacklogs: 0,
    allowedBranches: ['Computer Engineering'],
    minSemester: 7,
    deadline: '2026-12-31T00:00:00.000Z',
    status: 'UPCOMING'
  };

  const mockEligibleStudents = [
    {
      id: 101,
      branch: 'Computer Engineering',
      cgpa: '8.50',
      activeBacklogs: 0,
      currentSemester: 7,
      user: {
        id: 10,
        prn: 'PRN001',
        name: 'Student One',
        email: 's1@rcpit.ac.in',
        phone: '9876543210'
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    coordToken = generateToken({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in' });
    studentToken = generateToken({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });
  });

  it('should return 401 if unauthenticated', async () => {
    const res = await request(app).get('/api/drives/1/eligible-students');
    expect(res.status).toBe(401);
  });

  it('should return 403 if called by a student', async () => {
    User.findByPk.mockResolvedValue({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });

    const res = await request(app)
      .get('/api/drives/1/eligible-students')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });

  it('should return eligible students list for TPO', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    Drive.findByPk.mockResolvedValue(mockDrive);
    StudentProfile.findAll.mockResolvedValue(mockEligibleStudents);

    const res = await request(app)
      .get('/api/drives/1/eligible-students')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eligibleStudents.length).toBe(1);
    expect(res.body.data.eligibleStudents[0].user.name).toBe('Student One');
  });

  it('should return eligible students list for Coordinator', async () => {
    User.findByPk.mockResolvedValue({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in' });
    Drive.findByPk.mockResolvedValue(mockDrive);
    StudentProfile.findAll.mockResolvedValue(mockEligibleStudents);

    const res = await request(app)
      .get('/api/drives/1/eligible-students')
      .set('Authorization', `Bearer ${coordToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if drive does not exist', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    Drive.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/drives/999/eligible-students')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(404);
  });
});

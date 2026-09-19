const request = require('supertest');

jest.mock('../models', () => ({
  Application: {
    findAll: jest.fn()
  },
  StudentProfile: {
    findOne: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  Drive: {},
  Department: {}
}));

const { app } = require('../server');
const { Application, StudentProfile, User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('GET /api/applications/me (Student Applications History)', () => {
  let studentToken;
  let tpoToken;

  beforeEach(() => {
    jest.clearAllMocks();
    studentToken = generateToken({ id: 5, role: 'student', email: 'student@rcpit.ac.in' });
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
  });

  it('should return 401 if unauthenticated', async () => {
    const res = await request(app).get('/api/applications/me');
    expect(res.status).toBe(401);
  });

  it('should return 403 if called by non-student role', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });

    const res = await request(app)
      .get('/api/applications/me')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(403);
  });

  it('should return 404 if student profile does not exist', async () => {
    User.findByPk.mockResolvedValue({ id: 5, role: 'student', email: 'student@rcpit.ac.in' });
    StudentProfile.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/applications/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(404);
  });

  it('should return student application history', async () => {
    User.findByPk.mockResolvedValue({ id: 5, role: 'student', email: 'student@rcpit.ac.in' });
    StudentProfile.findOne.mockResolvedValue({ id: 20, userId: 5 });

    const mockApplications = [
      {
        id: 1,
        studentId: 20,
        driveId: 10,
        status: 'APPLIED',
        appliedAt: new Date().toISOString(),
        drive: {
          id: 10,
          companyName: 'Infosys',
          role: 'Systems Engineer',
          ctc: 3.6
        }
      }
    ];
    Application.findAll.mockResolvedValue(mockApplications);

    const res = await request(app)
      .get('/api/applications/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].drive.companyName).toBe('Infosys');
  });
});

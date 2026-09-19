const request = require('supertest');

jest.mock('../models', () => ({
  Drive: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  StudentProfile: {}
}));

const { app } = require('../server');
const { Drive, User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('POST /api/drives (Create Drive)', () => {
  let tpoToken;
  let coordinatorToken;
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    coordinatorToken = generateToken({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in' });
    studentToken = generateToken({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });
  });

  it('should return 401 if unauthenticated', async () => {
    const res = await request(app).post('/api/drives').send({});
    expect(res.status).toBe(401);
  });

  it('should return 403 if called by non-TPO (coordinator or student)', async () => {
    User.findByPk.mockResolvedValue({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in' });

    const res1 = await request(app)
      .post('/api/drives')
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        companyName: 'TCS',
        role: 'Software Engineer',
        ctc: 7.5,
        allowedBranches: ['Computer Engineering'],
        deadline: new Date(Date.now() + 86400000).toISOString()
      });
    expect(res1.status).toBe(403);

    User.findByPk.mockResolvedValue({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });
    const res2 = await request(app)
      .post('/api/drives')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    expect(res2.status).toBe(403);
  });

  it('should return 400 on validation failure', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });

    const res = await request(app)
      .post('/api/drives')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({
        companyName: '',
        role: '',
        ctc: -2
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should successfully create a drive when called by TPO', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });

    const createdDriveMock = {
      id: 10,
      companyName: 'TCS Ninja',
      role: 'System Engineer',
      description: 'Campus hiring drive for 2026 batch',
      ctc: 7.5,
      minCgpa: 6.5,
      maxActiveBacklogs: 0,
      allowedBranches: ['Computer Engineering', 'Information Technology'],
      minSemester: 7,
      deadline: '2026-10-30T00:00:00.000Z',
      createdBy: 1,
      status: 'UPCOMING'
    };
    Drive.create.mockResolvedValue(createdDriveMock);

    const payload = {
      companyName: 'TCS Ninja',
      role: 'System Engineer',
      description: 'Campus hiring drive for 2026 batch',
      ctc: 7.5,
      minCgpa: 6.5,
      maxActiveBacklogs: 0,
      allowedBranches: ['Computer Engineering', 'Information Technology'],
      minSemester: 7,
      deadline: '2026-10-30T00:00:00.000Z',
      status: 'UPCOMING'
    };

    const res = await request(app)
      .post('/api/drives')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.companyName).toBe('TCS Ninja');
    expect(res.body.data.createdBy).toBe(1);
    expect(Drive.create).toHaveBeenCalledTimes(1);
  });
});

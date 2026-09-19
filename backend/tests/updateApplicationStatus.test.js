const request = require('supertest');

jest.mock('../models', () => ({
  Application: {
    findByPk: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  StudentProfile: {},
  Drive: {},
  Department: {}
}));

const { app } = require('../server');
const { Application, User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('PUT /api/applications/:id/status (Update Application Status)', () => {
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
    const res = await request(app).put('/api/applications/1/status').send({ status: 'SHORTLISTED' });
    expect(res.status).toBe(401);
  });

  it('should return 403 if called by student', async () => {
    User.findByPk.mockResolvedValue({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });

    const res = await request(app)
      .put('/api/applications/1/status')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'SHORTLISTED' });

    expect(res.status).toBe(403);
  });

  it('should return 400 on invalid status value', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });

    const res = await request(app)
      .put('/api/applications/1/status')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 if application is not found', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    Application.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/applications/999/status')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({ status: 'SHORTLISTED' });

    expect(res.status).toBe(404);
  });

  it('should successfully update status by TPO', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    const mockApp = {
      id: 1,
      studentId: 10,
      driveId: 2,
      status: 'APPLIED',
      notes: null,
      save: jest.fn().mockResolvedValue(true)
    };
    Application.findByPk.mockResolvedValue(mockApp);

    const res = await request(app)
      .put('/api/applications/1/status')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({ status: 'SHORTLISTED', notes: 'Cleared round 1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockApp.status).toBe('SHORTLISTED');
    expect(mockApp.notes).toBe('Cleared round 1');
    expect(mockApp.save).toHaveBeenCalledTimes(1);
  });
});

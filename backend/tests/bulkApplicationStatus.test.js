const request = require('supertest');

jest.mock('../models', () => ({
  Application: {
    update: jest.fn(),
    findAll: jest.fn()
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

describe('POST /api/applications/bulk-status & GET /api/applications/drive/:driveId', () => {
  let tpoToken;
  let coordinatorToken;
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    coordinatorToken = generateToken({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in' });
    studentToken = generateToken({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });
  });

  describe('POST /api/applications/bulk-status', () => {
    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).post('/api/applications/bulk-status').send({});
      expect(res.status).toBe(401);
    });

    it('should return 403 if called by student', async () => {
      User.findByPk.mockResolvedValue({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });

      const res = await request(app)
        .post('/api/applications/bulk-status')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ applicationIds: [1, 2], status: 'SHORTLISTED' });

      expect(res.status).toBe(403);
    });

    it('should return 400 on validation failure', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });

      const res = await request(app)
        .post('/api/applications/bulk-status')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({ applicationIds: [], status: 'INVALID' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully bulk update application statuses', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
      Application.update.mockResolvedValue([3]); // 3 rows affected

      const res = await request(app)
        .post('/api/applications/bulk-status')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          applicationIds: [1, 2, 3],
          status: 'ACCEPTED',
          notes: 'Selected in final interview'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.affectedCount).toBe(3);
      expect(res.body.data.status).toBe('ACCEPTED');
      expect(Application.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/applications/drive/:driveId', () => {
    it('should fetch all applications for a drive', async () => {
      User.findByPk.mockResolvedValue({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in' });
      const mockApplications = [
        {
          id: 1,
          studentId: 10,
          driveId: 5,
          status: 'APPLIED',
          appliedAt: new Date().toISOString()
        }
      ];
      Application.findAll.mockResolvedValue(mockApplications);

      const res = await request(app)
        .get('/api/applications/drive/5')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });
});

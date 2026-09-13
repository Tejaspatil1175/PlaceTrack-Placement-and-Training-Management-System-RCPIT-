const request = require('supertest');

jest.mock('../models', () => ({
  Department: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  StudentProfile: {}
}));

const { app } = require('../server');
const { Department, User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Department Endpoints', () => {
  let tpoToken;
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    studentToken = generateToken({ id: 2, role: 'student', email: 'student@rcpit.ac.in' });
  });

  describe('POST /api/departments', () => {
    it('should reject non-TPO users with 403', async () => {
      User.findByPk.mockResolvedValue({ id: 2, role: 'student', email: 'student@rcpit.ac.in' });

      const res = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: 'Computer Engineering' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing department name with 400', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });

      const res = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should reject duplicate department name with 409', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
      Department.findOne.mockResolvedValue({ id: 1, name: 'Computer Engineering' });

      const res = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({ name: 'Computer Engineering' });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('should create department successfully for TPO with 201', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
      Department.findOne.mockResolvedValue(null);
      Department.create.mockResolvedValue({ id: 10, name: 'Information Technology' });

      const res = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({ name: 'Information Technology' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Information Technology');
    });
  });
});

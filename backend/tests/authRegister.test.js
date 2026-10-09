const request = require('supertest');

jest.mock('../models', () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue()
  };
  return {
    User: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn()
    },
    Department: {
      findByPk: jest.fn()
    },
    StudentProfile: {
      create: jest.fn()
    },
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    }
  };
});

const { app } = require('../server');
const { User, StudentProfile } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Auth Registration & Profile Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Rohit Sharma' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should reject registration if email already exists', async () => {
      User.findOne.mockResolvedValueOnce({ id: 1, email: 'rohit@rcpit.ac.in' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Rohit Sharma',
          email: 'rohit@rcpit.ac.in',
          password: 'Password@123',
          prn: 'PRN2024099'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should register student successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 10,
        name: 'Rohit Sharma',
        email: 'rohit@rcpit.ac.in',
        prn: 'PRN2024099',
        role: 'student',
        departmentId: 1
      });
      StudentProfile.create.mockResolvedValue({
        id: 5,
        userId: 10,
        branch: 'Computer Engineering'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Rohit Sharma',
          email: 'rohit@rcpit.ac.in',
          password: 'Password@123',
          prn: 'PRN2024099',
          branch: 'Computer Engineering'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(false || true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('rohit@rcpit.ac.in');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should require authentication token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return user profile for authenticated user', async () => {
      const token = generateToken({ id: 10, role: 'student', email: 'rohit@rcpit.ac.in' });
      User.findByPk.mockResolvedValue({
        id: 10,
        name: 'Rohit Sharma',
        email: 'rohit@rcpit.ac.in',
        role: 'student'
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(10);
    });
  });
});

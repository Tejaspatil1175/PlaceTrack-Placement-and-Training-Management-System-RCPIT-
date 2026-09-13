const request = require('supertest');

jest.mock('../models', () => ({
  Department: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn()
  },
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn()
  },
  StudentProfile: {}
}));

const { app } = require('../server');
const { Department, User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Coordinator Management Endpoints', () => {
  let tpoToken;
  let coordinatorToken;
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    coordinatorToken = generateToken({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in' });
    studentToken = generateToken({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });
  });

  describe('POST /api/users/coordinator (Step 33)', () => {
    it('should reject non-TPO with 403', async () => {
      User.findByPk.mockResolvedValue({ id: 2, role: 'coordinator' });

      const res = await request(app)
        .post('/api/users/coordinator')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          name: 'Prof. Sharma',
          email: 'sharma@rcpit.ac.in',
          departmentId: 1
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if department does not exist', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      Department.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/users/coordinator')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          name: 'Prof. Sharma',
          email: 'sharma@rcpit.ac.in',
          departmentId: 99
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Department not found');
    });

    it('should return 409 if email already exists', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      Department.findByPk.mockResolvedValue({ id: 1, name: 'Computer' });
      User.findOne.mockResolvedValue({ id: 5, email: 'sharma@rcpit.ac.in' });

      const res = await request(app)
        .post('/api/users/coordinator')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          name: 'Prof. Sharma',
          email: 'sharma@rcpit.ac.in',
          departmentId: 1
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('should create coordinator successfully with 201', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      Department.findByPk.mockResolvedValue({ id: 1, name: 'Computer' });
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 20,
        name: 'Prof. Sharma',
        email: 'sharma@rcpit.ac.in',
        phone: '9876543210',
        role: 'coordinator',
        departmentId: 1,
        mustResetPassword: true,
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .post('/api/users/coordinator')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          name: 'Prof. Sharma',
          email: 'sharma@rcpit.ac.in',
          phone: '9876543210',
          departmentId: 1
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('coordinator');
      expect(res.body.data.mustResetPassword).toBe(true);
    });
  });

  describe('GET /api/users/coordinators & GET /api/departments (Step 34)', () => {
    it('should list all coordinators for TPO', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      User.findAll.mockResolvedValue([
        { id: 2, name: 'Prof. Sharma', email: 'sharma@rcpit.ac.in', department: { id: 1, name: 'Computer' } }
      ]);

      const res = await request(app)
        .get('/api/users/coordinators')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('should list all departments with coordinators', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      Department.findAll.mockResolvedValue([
        { id: 1, name: 'Computer', users: [{ id: 2, name: 'Prof. Sharma' }] }
      ]);

      const res = await request(app)
        .get('/api/departments')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('PUT & DELETE /api/users/coordinator/:id (Step 35)', () => {
    it('should update coordinator successfully', async () => {
      const coordinatorRecord = {
        id: 2,
        name: 'Prof. Old Name',
        email: 'old@rcpit.ac.in',
        phone: '1111111111',
        departmentId: 1,
        role: 'coordinator',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      User.findOne.mockResolvedValue(coordinatorRecord);

      const res = await request(app)
        .put('/api/users/coordinator/2')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          name: 'Prof. New Name',
          phone: '9999999999'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(coordinatorRecord.name).toBe('Prof. New Name');
      expect(coordinatorRecord.save).toHaveBeenCalled();
    });

    it('should delete coordinator successfully', async () => {
      const coordinatorRecord = {
        id: 2,
        name: 'Prof. Sharma',
        role: 'coordinator',
        destroy: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      User.findOne.mockResolvedValue(coordinatorRecord);

      const res = await request(app)
        .delete('/api/users/coordinator/2')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(coordinatorRecord.destroy).toHaveBeenCalled();
    });
  });
});

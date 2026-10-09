const request = require('supertest');

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn()
  },
  Drive: {
    findByPk: jest.fn(),
    create: jest.fn()
  },
  StudentProfile: {},
  Department: {}
}));

const { app } = require('../server');
const { User, Drive } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Admin Drive Management Endpoints (Update & Delete)', () => {
  let tpoToken;
  let coordinatorToken;
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    coordinatorToken = generateToken({ id: 2, role: 'coordinator', departmentId: 1, email: 'coord@rcpit.ac.in' });
    studentToken = generateToken({ id: 10, role: 'student', email: 'student@rcpit.ac.in' });

    User.findByPk.mockImplementation((id) => {
      if (id === 1) return Promise.resolve({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
      if (id === 2) return Promise.resolve({ id: 2, role: 'coordinator', departmentId: 1, email: 'coord@rcpit.ac.in' });
      if (id === 10) return Promise.resolve({ id: 10, role: 'student', email: 'student@rcpit.ac.in' });
      return Promise.resolve(null);
    });
  });

  describe('PUT /api/drives/:id', () => {
    it('should allow TPO to update drive criteria and package', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockDrive = {
        id: 5,
        companyName: 'TCS',
        role: 'Ninja Developer',
        ctc: 3.5,
        save: mockSave
      };

      Drive.findByPk.mockResolvedValue(mockDrive);

      const res = await request(app)
        .put('/api/drives/5')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          role: 'Digital Specialist',
          ctc: 7.0
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockDrive.role).toBe('Digital Specialist');
      expect(mockDrive.ctc).toBe(7.0);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should forbid coordinator and student from updating drive', async () => {
      const res = await request(app)
        .put('/api/drives/5')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({ ctc: 10.0 });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/drives/:id', () => {
    it('should allow TPO to delete a drive', async () => {
      const mockDestroy = jest.fn().mockResolvedValue(true);
      Drive.findByPk.mockResolvedValue({
        id: 5,
        destroy: mockDestroy
      });

      const res = await request(app)
        .delete('/api/drives/5')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should forbid coordinator and student from deleting drive', async () => {
      const res = await request(app)
        .delete('/api/drives/5')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });
});

const request = require('supertest');

jest.mock('../models', () => ({
  Notification: {
    findAll: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  Department: {
    findByPk: jest.fn()
  },
  StudentProfile: {},
  Drive: {},
  Application: {}
}));

const { app } = require('../server');
const { Notification, User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('GET /api/notifications/me - Student Notification Listing', () => {
  let studentToken;
  let tpoToken;

  beforeEach(() => {
    jest.clearAllMocks();
    studentToken = generateToken({ id: 5, role: 'student', email: 'student@rcpit.ac.in' });
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
  });

  it('should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/notifications/me');
    expect(res.status).toBe(401);
  });

  it('should return scoped notifications for a student', async () => {
    User.findByPk.mockResolvedValue({
      id: 5,
      role: 'student',
      email: 'student@rcpit.ac.in',
      departmentId: 2
    });

    const mockNotifications = [
      {
        id: 1,
        title: 'Resume Workshop',
        message: 'Workshop scheduled tomorrow',
        targetType: 'ALL',
        type: 'GENERAL',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Dept Mock Interviews',
        message: 'Comp Dept mock interviews',
        targetType: 'DEPARTMENT',
        targetDepartmentId: 2,
        type: 'GENERAL',
        createdAt: new Date().toISOString()
      }
    ];

    Notification.findAll.mockResolvedValue(mockNotifications);

    const res = await request(app)
      .get('/api/notifications/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(Notification.findAll).toHaveBeenCalled();
  });

  it('should return all notifications for TPO in GET /api/notifications', async () => {
    User.findByPk.mockResolvedValue({
      id: 1,
      role: 'tpo',
      email: 'tpo@rcpit.ac.in'
    });

    Notification.findAll.mockResolvedValue([
      { id: 1, title: 'All drives notice' },
      { id: 2, title: 'Dept notice' }
    ]);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });
});

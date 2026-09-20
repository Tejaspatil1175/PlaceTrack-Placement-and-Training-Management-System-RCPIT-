const request = require('supertest');

jest.mock('../models', () => ({
  Notification: {
    create: jest.fn()
  },
  User: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  Department: {
    findByPk: jest.fn()
  },
  StudentProfile: {},
  Drive: {},
  Application: {}
}));

const { app } = require('../server');
const { Notification, User, Department } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('POST /api/notifications - Create Notification', () => {
  let tpoToken;
  let coordinatorToken;
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    coordinatorToken = generateToken({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in' });
    studentToken = generateToken({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });
  });

  it('should reject unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/notifications').send({
      title: 'T&P Update',
      message: 'Drive update message'
    });
    expect(res.status).toBe(401);
  });

  it('should reject student access with 403 Forbidden', async () => {
    User.findByPk.mockResolvedValue({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });

    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'T&P Update',
        message: 'Drive update message'
      });

    expect(res.status).toBe(403);
  });

  it('should reject invalid payload with 400 Bad Request', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });

    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({
        title: '',
        message: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow TPO to create global notification', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    Notification.create.mockResolvedValue({
      id: 10,
      title: 'Campus Placement Drive Announcement',
      message: 'TCS Ninja drive registration is now live.',
      targetType: 'ALL',
      targetDepartmentId: null,
      sentBy: 1,
      type: 'DRIVE'
    });

    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({
        title: 'Campus Placement Drive Announcement',
        message: 'TCS Ninja drive registration is now live.',
        targetType: 'ALL',
        type: 'DRIVE'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Campus Placement Drive Announcement');
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Campus Placement Drive Announcement',
        targetType: 'ALL',
        sentBy: 1
      })
    );
  });

  it('should scope coordinator notifications to their assigned department', async () => {
    User.findByPk.mockResolvedValue({ id: 2, role: 'coordinator', email: 'coord@rcpit.ac.in', departmentId: 4 });
    Department.findByPk.mockResolvedValue({ id: 4, name: 'Computer Engineering' });
    Notification.create.mockResolvedValue({
      id: 11,
      title: 'Department Assessment',
      message: 'Mock interview session this Saturday.',
      targetType: 'DEPARTMENT',
      targetDepartmentId: 4,
      sentBy: 2,
      type: 'GENERAL'
    });

    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        title: 'Department Assessment',
        message: 'Mock interview session this Saturday.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: 'DEPARTMENT',
        targetDepartmentId: 4,
        sentBy: 2
      })
    );
  });
});

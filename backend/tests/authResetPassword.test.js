const request = require('supertest');

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn()
  },
  Department: {},
  StudentProfile: {}
}));

const { app } = require('../server');
const { User } = require('../models');
const { hashPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

describe('POST /api/auth/first-login-reset', () => {
  let token;
  let userRecord;

  beforeEach(async () => {
    jest.clearAllMocks();
    token = generateToken({ id: 5, role: 'student', email: 'reset@rcpit.ac.in', prn: 'PRN2024005' });
    const currentHashedPassword = await hashPassword('DefaultPRN123');

    userRecord = {
      id: 5,
      role: 'student',
      email: 'reset@rcpit.ac.in',
      prn: 'PRN2024005',
      passwordHash: currentHashedPassword,
      mustResetPassword: true,
      save: jest.fn().mockResolvedValue(true)
    };
  });

  it('should return 401 if token is missing', async () => {
    const res = await request(app)
      .post('/api/auth/first-login-reset')
      .send({ currentPassword: 'DefaultPRN123', newPassword: 'BrandNewPassword123' });

    expect(res.status).toBe(401);
  });

  it('should return 400 if currentPassword does not match', async () => {
    User.findByPk.mockResolvedValue(userRecord);

    const res = await request(app)
      .post('/api/auth/first-login-reset')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongPassword', newPassword: 'BrandNewPassword123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Current password');
  });

  it('should return 400 if new password is too short', async () => {
    User.findByPk.mockResolvedValue(userRecord);

    const res = await request(app)
      .post('/api/auth/first-login-reset')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'DefaultPRN123', newPassword: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors.some(e => e.message.includes('at least 6 characters'))).toBe(true);
  });

  it('should return 400 if new password equals current password', async () => {
    User.findByPk.mockResolvedValue(userRecord);

    const res = await request(app)
      .post('/api/auth/first-login-reset')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'DefaultPRN123', newPassword: 'DefaultPRN123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors.some(e => e.message.includes('different from current password'))).toBe(true);
  });

  it('should reset password successfully and clear mustResetPassword', async () => {
    User.findByPk.mockImplementation(() => Promise.resolve(userRecord));

    const res = await request(app)
      .post('/api/auth/first-login-reset')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'DefaultPRN123', newPassword: 'StrongNewPassword2026!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(userRecord.mustResetPassword).toBe(false);
    expect(userRecord.save).toHaveBeenCalled();
    expect(res.body.data.token).toBeDefined();
  });
});

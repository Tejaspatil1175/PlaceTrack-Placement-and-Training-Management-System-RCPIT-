const request = require('supertest');

jest.mock('../models', () => ({
  User: {
    findOne: jest.fn()
  },
  Department: {},
  StudentProfile: {}
}));

const { app } = require('../server');
const { User } = require('../models');
const { hashPassword } = require('../utils/password');

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if identifier or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@rcpit.ac.in' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('required');
  });

  it('should return 401 if user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nonexistent@rcpit.ac.in', password: 'Password123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid');
  });

  it('should return 401 on incorrect password', async () => {
    const hashedPassword = await hashPassword('CorrectPassword123');
    User.findOne.mockResolvedValue({
      id: 1,
      name: 'Test Student',
      email: 'student@rcpit.ac.in',
      prn: 'PRN2024001',
      passwordHash: hashedPassword,
      role: 'student',
      mustResetPassword: false,
      department: null,
      studentProfile: null
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'student@rcpit.ac.in', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 200 with JWT and user data on valid login with PRN', async () => {
    const hashedPassword = await hashPassword('StudentPass123');
    User.findOne.mockResolvedValue({
      id: 10,
      name: 'John Doe',
      email: 'john@rcpit.ac.in',
      prn: 'PRN2024001',
      passwordHash: hashedPassword,
      role: 'student',
      mustResetPassword: true,
      department: { id: 1, name: 'Computer Engineering' },
      studentProfile: { id: 5, branch: 'Computer Engineering', cgpa: 9.15 }
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ prn: 'PRN2024001', password: 'StudentPass123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.mustResetPassword).toBe(true);
    expect(res.body.data.user.name).toBe('John Doe');
  });
});

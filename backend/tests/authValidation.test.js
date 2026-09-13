const request = require('supertest');

jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn()
  },
  Department: {},
  StudentProfile: {}
}));

const { app } = require('../server');

describe('Auth Validation Middleware', () => {
  it('should return 400 when identifier is completely missing on login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'SomePassword123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('should return 400 when password is empty on login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@rcpit.ac.in', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
  });
});

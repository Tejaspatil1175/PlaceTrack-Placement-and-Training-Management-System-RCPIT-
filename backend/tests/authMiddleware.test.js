const authenticate = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');
const { User } = require('../models');

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn()
  },
  Department: {},
  StudentProfile: {}
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Authentication token required')
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is not Bearer', async () => {
    req.headers.authorization = 'Basic 12345';
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid JWT token', async () => {
    req.headers.authorization = 'Bearer invalid.token.value';
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid or expired token'
      })
    );
  });

  it('should return 401 if user is not found in database', async () => {
    const token = generateToken({ id: 999 });
    req.headers.authorization = `Bearer ${token}`;
    User.findByPk.mockResolvedValue(null);

    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('no longer exists')
      })
    );
  });

  it('should set req.user and call next() on valid token and user', async () => {
    const fakeUser = { id: 1, name: 'Test User', role: 'student' };
    const token = generateToken({ id: 1 });
    req.headers.authorization = `Bearer ${token}`;
    User.findByPk.mockResolvedValue(fakeUser);

    await authenticate(req, res, next);
    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });
});

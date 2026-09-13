const request = require('supertest');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');
const { app } = require('../server');

describe('Error Handling Middleware', () => {
  it('should return 404 for unknown routes via notFoundHandler', async () => {
    const res = await request(app).get('/api/some-non-existent-route-404');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Resource not found');
  });

  it('should format general errors with status code and message', () => {
    const err = new Error('Custom service error');
    err.statusCode = 400;

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Custom service error'
      })
    );
  });

  it('should handle SequelizeUniqueConstraintError with 409 status', () => {
    const err = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ path: 'email', message: 'email must be unique' }]
    };

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Duplicate entry error: record already exists',
        errors: [{ field: 'email', message: 'email must be unique' }]
      })
    );
  });
});

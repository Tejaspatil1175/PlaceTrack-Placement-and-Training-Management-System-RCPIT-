const { requireRole } = require('../middleware/rbac');

describe('RBAC Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 401 if req.user is missing', () => {
    const middleware = requireRole('tpo');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Authentication required'
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user does not have required role', () => {
    req.user = { id: 1, role: 'student' };
    const middleware = requireRole('tpo', 'coordinator');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Forbidden')
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if user has the single required role', () => {
    req.user = { id: 1, role: 'tpo' };
    const middleware = requireRole('tpo');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next() if user role is in array of allowed roles', () => {
    req.user = { id: 2, role: 'coordinator' };
    const middleware = requireRole(['tpo', 'coordinator']);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

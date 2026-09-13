const { generateToken, verifyToken } = require('../utils/jwt');

describe('JWT Utility', () => {
  it('should generate a valid JWT and decode its payload', () => {
    const userPayload = {
      id: 101,
      role: 'student',
      prn: 'PRN12345678',
      email: 'student@rcpit.ac.in'
    };

    const token = generateToken(userPayload, '1h');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(101);
    expect(decoded.role).toBe('student');
    expect(decoded.prn).toBe('PRN12345678');
    expect(decoded.email).toBe('student@rcpit.ac.in');
    expect(decoded.exp).toBeDefined();
  });

  it('should throw error when verifying invalid or tampered token', () => {
    expect(() => verifyToken('invalid.token.structure')).toThrow();
  });

  it('should throw error when missing payload or token', () => {
    expect(() => generateToken(null)).toThrow('Valid payload object is required');
    expect(() => verifyToken('')).toThrow('Token string is required');
  });
});

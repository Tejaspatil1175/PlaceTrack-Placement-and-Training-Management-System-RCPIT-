const { hashPassword, comparePassword } = require('../utils/password');

describe('Password Utility', () => {
  it('should hash a password and verify it correctly', async () => {
    const plain = 'Secret123!';
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);
    expect(await comparePassword(plain, hash)).toBe(true);
    expect(await comparePassword('WrongPassword', hash)).toBe(false);
  });

  it('should return false when comparing empty or invalid values', async () => {
    expect(await comparePassword('', '')).toBe(false);
    expect(await comparePassword(null, 'somehash')).toBe(false);
  });

  it('should throw error when hashing non-string or empty input', async () => {
    await expect(hashPassword('')).rejects.toThrow('Password string is required');
  });
});

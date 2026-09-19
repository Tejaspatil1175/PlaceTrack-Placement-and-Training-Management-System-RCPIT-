const { Drive, User } = require('../models');

describe('Drive Model', () => {
  it('should have correct attributes and options', () => {
    const rawAttributes = Drive.rawAttributes;

    expect(rawAttributes.companyName).toBeDefined();
    expect(rawAttributes.role).toBeDefined();
    expect(rawAttributes.ctc).toBeDefined();
    expect(rawAttributes.minCgpa).toBeDefined();
    expect(rawAttributes.maxActiveBacklogs).toBeDefined();
    expect(rawAttributes.allowedBranches).toBeDefined();
    expect(rawAttributes.minSemester).toBeDefined();
    expect(rawAttributes.deadline).toBeDefined();
    expect(rawAttributes.createdBy).toBeDefined();
    expect(rawAttributes.status).toBeDefined();

    expect(Drive.tableName).toBe('drives');
  });

  it('should have association with User', () => {
    expect(Drive.associations.creator).toBeDefined();
    expect(User.associations.createdDrives).toBeDefined();
  });
});

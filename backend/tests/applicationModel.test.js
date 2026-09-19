const { Application, StudentProfile, Drive } = require('../models');

describe('Application Model', () => {
  it('should have correct attributes and options', () => {
    const rawAttributes = Application.rawAttributes;

    expect(rawAttributes.studentId).toBeDefined();
    expect(rawAttributes.driveId).toBeDefined();
    expect(rawAttributes.status).toBeDefined();
    expect(rawAttributes.appliedAt).toBeDefined();
    expect(rawAttributes.notes).toBeDefined();

    expect(Application.tableName).toBe('applications');
  });

  it('should have associations with StudentProfile and Drive', () => {
    expect(Application.associations.studentProfile).toBeDefined();
    expect(Application.associations.drive).toBeDefined();
    expect(StudentProfile.associations.applications).toBeDefined();
    expect(Drive.associations.applications).toBeDefined();
  });
});

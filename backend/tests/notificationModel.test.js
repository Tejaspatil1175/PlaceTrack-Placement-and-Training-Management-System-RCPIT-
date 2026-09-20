const { Notification, User, Department } = require('../models');

describe('Notification Model Tests', () => {
  it('should have correct attributes defined on the Notification model', () => {
    const rawAttributes = Notification.rawAttributes;

    expect(rawAttributes.id).toBeDefined();
    expect(rawAttributes.title).toBeDefined();
    expect(rawAttributes.message).toBeDefined();
    expect(rawAttributes.targetType).toBeDefined();
    expect(rawAttributes.targetDepartmentId).toBeDefined();
    expect(rawAttributes.sentBy).toBeDefined();
    expect(rawAttributes.type).toBeDefined();
  });

  it('should have associations configured for sender and targetDepartment', () => {
    expect(Notification.associations.sender).toBeDefined();
    expect(Notification.associations.targetDepartment).toBeDefined();
    expect(User.associations.sentNotifications).toBeDefined();
    expect(Department.associations.notifications).toBeDefined();
  });
});

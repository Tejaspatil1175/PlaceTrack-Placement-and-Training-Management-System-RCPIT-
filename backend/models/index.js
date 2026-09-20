const sequelize = require('../config/database');
const Department = require('./Department');
const User = require('./User');
const StudentProfile = require('./StudentProfile');
const SemesterRecord = require('./SemesterRecord');
const ExcelUploadLog = require('./ExcelUploadLog');
const Drive = require('./Drive');
const Application = require('./Application');
const Notification = require('./Notification');

// Associations

// 1. Department <-> User (Coordinators / Students belonging to Department)
Department.hasMany(User, {
  foreignKey: 'departmentId',
  as: 'users'
});
User.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department'
});

// 2. User <-> StudentProfile (1-to-1)
User.hasOne(StudentProfile, {
  foreignKey: 'userId',
  as: 'studentProfile',
  onDelete: 'CASCADE'
});
StudentProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 3. StudentProfile <-> SemesterRecord (1-to-Many normalized semester history)
StudentProfile.hasMany(SemesterRecord, {
  foreignKey: 'studentId',
  as: 'semesterRecords',
  onDelete: 'CASCADE'
});
SemesterRecord.belongsTo(StudentProfile, {
  foreignKey: 'studentId',
  as: 'studentProfile'
});

// 4. User <-> ExcelUploadLog (1-to-Many uploads by admin/coordinator)
User.hasMany(ExcelUploadLog, {
  foreignKey: 'uploadedBy',
  as: 'uploadLogs',
  onDelete: 'CASCADE'
});
ExcelUploadLog.belongsTo(User, {
  foreignKey: 'uploadedBy',
  as: 'uploader'
});

// 5. User <-> Drive (TPO creates Drives)
User.hasMany(Drive, {
  foreignKey: 'createdBy',
  as: 'createdDrives',
  onDelete: 'CASCADE'
});
Drive.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// 6. StudentProfile <-> Application <-> Drive
StudentProfile.hasMany(Application, {
  foreignKey: 'studentId',
  as: 'applications',
  onDelete: 'CASCADE'
});
Application.belongsTo(StudentProfile, {
  foreignKey: 'studentId',
  as: 'studentProfile'
});

Drive.hasMany(Application, {
  foreignKey: 'driveId',
  as: 'applications',
  onDelete: 'CASCADE'
});
Application.belongsTo(Drive, {
  foreignKey: 'driveId',
  as: 'drive'
});

// 7. Notification Associations (User sent, Department targeted)
User.hasMany(Notification, {
  foreignKey: 'sentBy',
  as: 'sentNotifications',
  onDelete: 'CASCADE'
});
Notification.belongsTo(User, {
  foreignKey: 'sentBy',
  as: 'sender'
});

Department.hasMany(Notification, {
  foreignKey: 'targetDepartmentId',
  as: 'notifications',
  onDelete: 'SET NULL'
});
Notification.belongsTo(Department, {
  foreignKey: 'targetDepartmentId',
  as: 'targetDepartment'
});

module.exports = {
  sequelize,
  Department,
  User,
  StudentProfile,
  SemesterRecord,
  ExcelUploadLog,
  Drive,
  Application,
  Notification
};



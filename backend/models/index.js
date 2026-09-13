const sequelize = require('../config/database');
const Department = require('./Department');
const User = require('./User');
const StudentProfile = require('./StudentProfile');
const SemesterRecord = require('./SemesterRecord');
const ExcelUploadLog = require('./ExcelUploadLog');

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

module.exports = {
  sequelize,
  Department,
  User,
  StudentProfile,
  SemesterRecord,
  ExcelUploadLog
};

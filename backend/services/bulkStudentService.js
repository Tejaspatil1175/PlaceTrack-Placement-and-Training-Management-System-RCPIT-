const { sequelize, User, StudentProfile, SemesterRecord, Department } = require('../models');
const { hashPassword } = require('../utils/password');
const { recalculateStudentAcademics } = require('./academicEngine');
const { validateStudentRow } = require('../validators/excelRowValidator');

/**
 * Service for transactional bulk student ingestion and delta uploads.
 *
 * @param {Array<object>} parsedRows - Array of parsed rows from excelParser
 * @param {object} [options] - Ingestion configuration options
 * @param {number} [options.uploadedById] - User ID of admin/coordinator
 * @param {boolean} [options.isDelta=false] - If true, performs semester delta updates on existing students
 * @returns {Promise<{ totalRows: number, successCount: number, errorCount: number, errors: Array<{ row: number, prn: string, message: string }>, createdStudents: Array<object> }>}
 */
const ingestStudentRows = async (parsedRows = [], options = {}) => {
  const isDelta = !!options.isDelta;
  const errors = [];
  const processedStudents = [];

  let successCount = 0;
  let errorCount = 0;

  for (const row of parsedRows) {
    const { rowNumber, userFields, studentFields, semesterRecords } = row;
    const prn = userFields && userFields.prn ? String(userFields.prn).trim() : '';

    // Step 1: Row validation
    const rowValidation = validateStudentRow(row, isDelta);
    if (!rowValidation.isValid) {
      errorCount++;
      errors.push({
        row: rowNumber,
        prn: prn || 'UNKNOWN',
        message: rowValidation.errors.join('; ')
      });
      continue;
    }

    // Step 2: Execute transactional row insertion / update
    try {
      await sequelize.transaction(async (t) => {
        if (isDelta) {
          // Delta flow (Step 46): Update existing student's semester records
          const user = await User.findOne({
            where: { prn },
            include: [{ model: StudentProfile, as: 'studentProfile' }],
            transaction: t
          });

          if (!user || !user.studentProfile) {
            throw new Error(`Student with PRN '${prn}' does not exist for delta update`);
          }

          const studentProfileId = user.studentProfile.id;

          // Upsert semester records for this student
          for (const sem of semesterRecords) {
            const existingSem = await SemesterRecord.findOne({
              where: {
                studentId: studentProfileId,
                semesterNumber: sem.semesterNumber
              },
              transaction: t
            });

            if (existingSem) {
              await existingSem.update(
                {
                  sgpa: sem.sgpa,
                  credits: sem.credits,
                  newBacklogs: sem.newBacklogs !== undefined ? sem.newBacklogs : existingSem.newBacklogs,
                  clearedBacklogs: sem.clearedBacklogs !== undefined ? sem.clearedBacklogs : existingSem.clearedBacklogs
                },
                { transaction: t }
              );
            } else {
              await SemesterRecord.create(
                {
                  studentId: studentProfileId,
                  semesterNumber: sem.semesterNumber,
                  sgpa: sem.sgpa,
                  credits: sem.credits,
                  newBacklogs: sem.newBacklogs || 0,
                  clearedBacklogs: sem.clearedBacklogs || 0
                },
                { transaction: t }
              );
            }
          }

          // Recalculate academic aggregates
          await recalculateStudentAcademics(studentProfileId, { transaction: t });

          processedStudents.push({
            rowNumber,
            prn: user.prn,
            name: user.name,
            action: 'updated'
          });
          successCount++;
        } else {
          // Full ingestion flow (Steps 41 & 42): Create User -> Profile -> Semesters -> Recalculate
          const existingUser = await User.findOne({
            where: {
              [sequelize.Sequelize.Op.or]: [
                { prn: userFields.prn },
                { email: userFields.email }
              ]
            },
            transaction: t
          });

          if (existingUser) {
            if (existingUser.prn === userFields.prn) {
              throw new Error(`Student with PRN '${userFields.prn}' already exists`);
            }
            if (existingUser.email === userFields.email) {
              throw new Error(`User with email '${userFields.email}' already exists`);
            }
          }

          // Default credentials generation (Step 42): Password = PRN, mustResetPassword = true
          const defaultPassword = String(userFields.prn).trim();
          const passwordHash = await hashPassword(defaultPassword);

          // Department linkage if branch matches
          let departmentId = null;
          if (studentFields.branch) {
            const department = await Department.findOne({
              where: { name: studentFields.branch },
              transaction: t
            });
            if (department) {
              departmentId = department.id;
            }
          }

          // Create User
          const user = await User.create(
            {
              prn: userFields.prn,
              name: userFields.name,
              email: userFields.email,
              phone: userFields.phone || null,
              dob: userFields.dob || null,
              gender: userFields.gender || null,
              category: userFields.category || null,
              passwordHash,
              role: 'student',
              departmentId,
              mustResetPassword: true
            },
            { transaction: t }
          );

          // Create StudentProfile
          const studentProfile = await StudentProfile.create(
            {
              userId: user.id,
              branch: studentFields.branch,
              division: studentFields.division || null,
              admissionYear: studentFields.admissionYear,
              currentSemester: studentFields.currentSemester,
              address: studentFields.address || null,
              cgpa: 0.00,
              activeBacklogs: 0
            },
            { transaction: t }
          );

          // Create SemesterRecords
          if (Array.isArray(semesterRecords) && semesterRecords.length > 0) {
            for (const sem of semesterRecords) {
              await SemesterRecord.create(
                {
                  studentId: studentProfile.id,
                  semesterNumber: sem.semesterNumber,
                  sgpa: sem.sgpa,
                  credits: sem.credits || 0,
                  newBacklogs: sem.newBacklogs || 0,
                  clearedBacklogs: sem.clearedBacklogs || 0
                },
                { transaction: t }
              );
            }
          }

          // Recalculate CGPA & Active Backlogs (Step 22 engine)
          await recalculateStudentAcademics(studentProfile.id, { transaction: t });

          processedStudents.push({
            rowNumber,
            prn: user.prn,
            name: user.name,
            email: user.email,
            action: 'created'
          });
          successCount++;
        }
      });
    } catch (err) {
      errorCount++;
      errors.push({
        row: rowNumber,
        prn: prn || 'UNKNOWN',
        message: err.message || 'Database transaction failed'
      });
    }
  }

  return {
    totalRows: parsedRows.length,
    successCount,
    errorCount,
    errors,
    processedStudents
  };
};

module.exports = {
  ingestStudentRows
};

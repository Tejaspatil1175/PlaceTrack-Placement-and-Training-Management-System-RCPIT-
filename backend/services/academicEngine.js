/**
 * Academic Computation Engine for PlaceTrack
 * Implements university credit-weighted CGPA & stateful backlog calculations
 */

/**
 * Computes credit-weighted CGPA across completed semester records.
 * Formula: Sum(SGPA_i * Credits_i) / Sum(Credits_i)
 *
 * @param {Array<Object>} semesterRecords - Array of semester records
 * @returns {number} - Computed CGPA rounded to 2 decimal places (0.00 - 10.00)
 */
function computeCgpa(semesterRecords = []) {
  if (!Array.isArray(semesterRecords) || semesterRecords.length === 0) {
    return 0.00;
  }

  // Filter valid completed semester records with non-null SGPA
  const validRecords = semesterRecords.filter(
    (record) =>
      record &&
      record.sgpa !== null &&
      record.sgpa !== undefined &&
      record.sgpa !== '' &&
      !isNaN(parseFloat(record.sgpa)) &&
      parseFloat(record.sgpa) >= 0
  );

  if (validRecords.length === 0) {
    return 0.00;
  }

  let totalWeightedGradePoints = 0;
  let totalCredits = 0;
  let simpleSgpaSum = 0;

  for (const record of validRecords) {
    const sgpa = parseFloat(record.sgpa);
    const credits = record.credits !== null && record.credits !== undefined && !isNaN(parseInt(record.credits, 10))
      ? parseInt(record.credits, 10)
      : 0;

    if (credits > 0) {
      totalWeightedGradePoints += sgpa * credits;
      totalCredits += credits;
    }
    simpleSgpaSum += sgpa;
  }

  // If credit data is available, compute credit-weighted CGPA
  if (totalCredits > 0) {
    const cgpa = totalWeightedGradePoints / totalCredits;
    return Math.min(10.00, Math.max(0.00, parseFloat(cgpa.toFixed(2))));
  }

  // Fallback to simple average if no credits were specified across all semesters
  const simpleAverage = simpleSgpaSum / validRecords.length;
  return Math.min(10.00, Math.max(0.00, parseFloat(simpleAverage.toFixed(2))));
}

/**
 * Computes the stateful running count of active uncleared backlogs.
 * Running sum of (newBacklogs - clearedBacklogs) across semesters, floored at 0.
 *
 * @param {Array<Object>} semesterRecords - Array of semester records
 * @returns {number} - Active backlog count (integer >= 0)
 */
function computeActiveBacklogs(semesterRecords = []) {
  if (!Array.isArray(semesterRecords) || semesterRecords.length === 0) {
    return 0;
  }

  // Sort by semester number ascending to ensure chronological evaluation
  const sortedRecords = [...semesterRecords].sort((a, b) => {
    const semA = a.semesterNumber || 0;
    const semB = b.semesterNumber || 0;
    return semA - semB;
  });

  let runningBacklogs = 0;

  for (const record of sortedRecords) {
    if (!record) continue;

    const newBacklogs = record.newBacklogs !== null && record.newBacklogs !== undefined && !isNaN(parseInt(record.newBacklogs, 10))
      ? Math.max(0, parseInt(record.newBacklogs, 10))
      : 0;

    const clearedBacklogs = record.clearedBacklogs !== null && record.clearedBacklogs !== undefined && !isNaN(parseInt(record.clearedBacklogs, 10))
      ? Math.max(0, parseInt(record.clearedBacklogs, 10))
      : 0;

    runningBacklogs = Math.max(0, runningBacklogs + newBacklogs - clearedBacklogs);
  }

  return runningBacklogs;
}

/**
 * Recomputes CGPA and active backlogs from all SemesterRecords for a student
 * and updates the cached fields on StudentProfile.
 *
 * @param {number} studentId - Primary key of StudentProfile
 * @param {Object} [options] - Optional Sequelize options (e.g. { transaction })
 * @returns {Promise<Object>} - Updated academic values { cgpa, activeBacklogs, studentProfile }
 */
async function recalculateStudentAcademics(studentId, options = {}) {
  const { StudentProfile, SemesterRecord } = require('../models');

  const studentProfile = await StudentProfile.findByPk(studentId, {
    transaction: options.transaction
  });

  if (!studentProfile) {
    throw new Error(`StudentProfile with id ${studentId} not found`);
  }

  const semesterRecords = await SemesterRecord.findAll({
    where: { studentId },
    order: [['semesterNumber', 'ASC']],
    transaction: options.transaction
  });

  const cgpa = computeCgpa(semesterRecords);
  const activeBacklogs = computeActiveBacklogs(semesterRecords);

  await studentProfile.update(
    {
      cgpa,
      activeBacklogs
    },
    {
      transaction: options.transaction
    }
  );

  return {
    studentId,
    cgpa,
    activeBacklogs,
    studentProfile
  };
}

module.exports = {
  computeCgpa,
  computeActiveBacklogs,
  recalculateStudentAcademics
};

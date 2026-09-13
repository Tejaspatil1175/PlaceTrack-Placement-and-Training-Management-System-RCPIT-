/**
 * Validates an individual parsed student row against academic and domain rules.
 * @param {object} parsedRow - { rowNumber, userFields, studentFields, semesterRecords }
 * @param {boolean} [isDelta=false] - If true, only validates fields present in delta mode
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validateStudentRow = (parsedRow, isDelta = false) => {
  const errors = [];
  const { rowNumber, userFields = {}, studentFields = {}, semesterRecords = [] } = parsedRow;

  // 1. PRN Validation
  if (!userFields.prn || String(userFields.prn).trim() === '') {
    errors.push(`Row ${rowNumber}: PRN is required and cannot be empty`);
  } else if (String(userFields.prn).length < 3 || String(userFields.prn).length > 30) {
    errors.push(`Row ${rowNumber}: PRN '${userFields.prn}' must be between 3 and 30 characters`);
  }

  // If delta mode, non-PRN basic fields are optional
  if (!isDelta) {
    // 2. Name
    if (!userFields.name || String(userFields.name).trim() === '') {
      errors.push(`Row ${rowNumber}: Student Name is required`);
    }

    // 3. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userFields.email || !emailRegex.test(String(userFields.email).trim())) {
      errors.push(`Row ${rowNumber}: Valid Email address is required (received: '${userFields.email || ''}')`);
    }

    // 4. Gender
    if (userFields.gender) {
      const validGenders = ['Male', 'Female', 'Other'];
      if (!validGenders.includes(userFields.gender)) {
        errors.push(`Row ${rowNumber}: Gender must be one of [${validGenders.join(', ')}] (received: '${userFields.gender}')`);
      }
    }

    // 5. Branch
    if (!studentFields.branch || String(studentFields.branch).trim() === '') {
      errors.push(`Row ${rowNumber}: Academic Branch is required`);
    }

    // 6. Current Semester
    if (
      studentFields.currentSemester === undefined ||
      studentFields.currentSemester === null ||
      isNaN(studentFields.currentSemester) ||
      studentFields.currentSemester < 1 ||
      studentFields.currentSemester > 8
    ) {
      errors.push(`Row ${rowNumber}: CurrentSemester must be an integer between 1 and 8`);
    }

    // 7. Admission Year
    if (
      studentFields.admissionYear === undefined ||
      studentFields.admissionYear === null ||
      isNaN(studentFields.admissionYear) ||
      studentFields.admissionYear < 2000 ||
      studentFields.admissionYear > 2100
    ) {
      errors.push(`Row ${rowNumber}: AdmissionYear must be a valid 4-digit year (e.g. 2021)`);
    }
  }

  // 8. Semester Records Validation
  if (Array.isArray(semesterRecords)) {
    semesterRecords.forEach((sem) => {
      const semNum = sem.semesterNumber;

      if (!semNum || semNum < 1 || semNum > 8) {
        errors.push(`Row ${rowNumber}: Semester number '${semNum}' is invalid (must be 1-8)`);
      }

      if (sem.sgpa !== null && sem.sgpa !== undefined) {
        const numSgpa = Number(sem.sgpa);
        if (isNaN(numSgpa) || numSgpa < 0 || numSgpa > 10) {
          errors.push(`Row ${rowNumber}: SEM${semNum}_SGPA (${sem.sgpa}) must be between 0.00 and 10.00`);
        }
      }

      if (sem.credits !== null && sem.credits !== undefined && sem.credits !== '') {
        const numCredits = Number(sem.credits);
        if (isNaN(numCredits) || numCredits < 0) {
          errors.push(`Row ${rowNumber}: SEM${semNum}_CREDITS (${sem.credits}) cannot be negative`);
        }
      }

      if (sem.newBacklogs !== null && sem.newBacklogs !== undefined && sem.newBacklogs !== '') {
        const numNew = Number(sem.newBacklogs);
        if (isNaN(numNew) || numNew < 0) {
          errors.push(`Row ${rowNumber}: SEM${semNum}_NEW_BACKLOGS (${sem.newBacklogs}) cannot be negative`);
        }
      }

      if (sem.clearedBacklogs !== null && sem.clearedBacklogs !== undefined && sem.clearedBacklogs !== '') {
        const numCleared = Number(sem.clearedBacklogs);
        if (isNaN(numCleared) || numCleared < 0) {
          errors.push(`Row ${rowNumber}: SEM${semNum}_CLEARED_BACKLOGS (${sem.clearedBacklogs}) cannot be negative`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateStudentRow
};

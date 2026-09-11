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

module.exports = {
  computeCgpa
};

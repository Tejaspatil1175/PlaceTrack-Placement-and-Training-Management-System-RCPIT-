const { Op } = require('sequelize');
const { Drive, StudentProfile, User, Department } = require('../models');

/**
 * Checks in-memory eligibility for a single student profile against a drive.
 * @param {Object} studentProfile - StudentProfile instance or plain object
 * @param {Object} drive - Drive instance or plain object
 * @returns {{ isEligible: boolean, reasons: string[] }}
 */
const checkStudentEligibility = (studentProfile, drive) => {
  if (!studentProfile) {
    return {
      isEligible: false,
      reasons: ['Student profile not found']
    };
  }

  if (!drive) {
    return {
      isEligible: false,
      reasons: ['Drive not found']
    };
  }

  const reasons = [];
  const now = new Date();
  const deadlineDate = new Date(drive.deadline);

  if (deadlineDate < now) {
    reasons.push('Application deadline has passed');
  }

  if (drive.status === 'COMPLETED' || drive.status === 'CANCELLED') {
    reasons.push(`Drive is ${drive.status.toLowerCase()}`);
  }

  const studentCgpa = parseFloat(studentProfile.cgpa || 0.0);
  const minCgpa = parseFloat(drive.minCgpa || 0.0);
  if (studentCgpa < minCgpa) {
    reasons.push(`CGPA ${studentCgpa.toFixed(2)} is below the required minimum of ${minCgpa.toFixed(2)}`);
  }

  const activeBacklogs = parseInt(studentProfile.activeBacklogs || 0, 10);
  const maxBacklogs = parseInt(drive.maxActiveBacklogs || 0, 10);
  if (activeBacklogs > maxBacklogs) {
    reasons.push(`Active backlogs (${activeBacklogs}) exceed maximum allowed (${maxBacklogs})`);
  }

  let allowedBranches = [];
  if (Array.isArray(drive.allowedBranches)) {
    allowedBranches = drive.allowedBranches;
  } else if (typeof drive.allowedBranches === 'string') {
    try {
      allowedBranches = JSON.parse(drive.allowedBranches);
    } catch {
      allowedBranches = [];
    }
  }

  if (allowedBranches.length > 0 && !allowedBranches.includes(studentProfile.branch)) {
    reasons.push(`Branch '${studentProfile.branch}' is not eligible for this drive`);
  }

  const currentSem = parseInt(studentProfile.currentSemester || 1, 10);
  const minSem = parseInt(drive.minSemester || 1, 10);
  if (currentSem < minSem) {
    reasons.push(`Current semester (${currentSem}) is below required minimum (${minSem})`);
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
};

/**
 * Fast database-level query to fetch all eligible students for a drive.
 * Leverages cached cgpa, activeBacklogs, branch, and currentSemester on StudentProfile.
 * @param {number} driveId
 * @returns {Promise<{ drive: Object, eligibleStudents: Array }>}
 */
const getEligibleStudentsForDrive = async (driveId) => {
  const drive = await Drive.findByPk(driveId);
  if (!drive) {
    const error = new Error('Placement drive not found');
    error.status = 404;
    throw error;
  }

  let allowedBranches = [];
  if (Array.isArray(drive.allowedBranches)) {
    allowedBranches = drive.allowedBranches;
  } else if (typeof drive.allowedBranches === 'string') {
    try {
      allowedBranches = JSON.parse(drive.allowedBranches);
    } catch {
      allowedBranches = [];
    }
  }

  const whereClause = {
    cgpa: { [Op.gte]: parseFloat(drive.minCgpa) },
    activeBacklogs: { [Op.lte]: parseInt(drive.maxActiveBacklogs, 10) },
    currentSemester: { [Op.gte]: parseInt(drive.minSemester, 10) }
  };

  if (allowedBranches.length > 0) {
    whereClause.branch = { [Op.in]: allowedBranches };
  }

  const eligibleStudents = await StudentProfile.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'prn', 'name', 'email', 'phone', 'gender', 'category'],
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }
        ]
      }
    ],
    order: [
      ['cgpa', 'DESC'],
      ['activeBacklogs', 'ASC']
    ]
  });

  return {
    drive,
    eligibleStudents
  };
};

module.exports = {
  checkStudentEligibility,
  getEligibleStudentsForDrive
};

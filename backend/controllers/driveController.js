const { Op } = require('sequelize');
const { Drive, User, StudentProfile } = require('../models');
const { checkStudentEligibility, getEligibleStudentsForDrive } = require('../services/eligibilityService');

/**
 * Step 55: Create a new placement drive (TPO only)
 */
const createDrive = async (req, res, next) => {
  try {
    const {
      companyName,
      role,
      description,
      ctc,
      minCgpa,
      maxActiveBacklogs,
      allowedBranches,
      minSemester,
      deadline,
      status
    } = req.body;

    const drive = await Drive.create({
      companyName,
      role,
      description,
      ctc,
      minCgpa: minCgpa !== undefined ? minCgpa : 0.0,
      maxActiveBacklogs: maxActiveBacklogs !== undefined ? maxActiveBacklogs : 0,
      allowedBranches,
      minSemester: minSemester !== undefined ? minSemester : 1,
      deadline,
      createdBy: req.user.id,
      status: status || 'UPCOMING'
    });

    return res.status(201).json({
      success: true,
      message: 'Placement drive created successfully',
      data: drive
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 56: List placement drives with role-aware visibility
 */
const listDrives = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const { Application } = require('../models');
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { companyName: { [Op.like]: `%${q}%` } },
        { role: { [Op.like]: `%${q}%` } }
      ];
    }

    const drives = await Drive.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'studentId', 'status']
        }
      ],
      order: [['deadline', 'ASC'], ['createdAt', 'DESC']]
    });

    // If student, annotate each drive with eligibility status and application status
    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({
        where: { userId: req.user.id }
      });

      const formattedDrives = drives.map((drive) => {
        const driveJson = drive.toJSON ? drive.toJSON() : { ...drive };
        const eligibility = checkStudentEligibility(studentProfile, drive);
        const myApp = (driveJson.applications || []).find((a) => a.studentId === studentProfile?.id);

        driveJson.isEligible = eligibility.isEligible;
        driveJson.eligibilityReasons = eligibility.reasons;
        driveJson.hasApplied = Boolean(myApp);
        driveJson.applicationStatus = myApp ? myApp.status : null;
        driveJson.applicantCount = (driveJson.applications || []).length;
        return driveJson;
      });

      return res.status(200).json({
        success: true,
        message: 'Drives fetched successfully',
        data: formattedDrives
      });
    }

    const formattedDrives = drives.map((drive) => {
      const driveJson = drive.toJSON ? drive.toJSON() : { ...drive };
      driveJson.applicantCount = (driveJson.applications || []).length;
      return driveJson;
    });

    return res.status(200).json({
      success: true,
      message: 'Drives fetched successfully',
      data: formattedDrives
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get drive by ID
 */
const getDriveById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Application } = require('../models');
    const drive = await Drive.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'studentId', 'status', 'appliedAt']
        }
      ]
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    const driveJson = drive.toJSON ? drive.toJSON() : { ...drive };
    driveJson.applicantCount = (driveJson.applications || []).length;

    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({
        where: { userId: req.user.id }
      });

      const eligibility = checkStudentEligibility(studentProfile, drive);
      const myApp = (driveJson.applications || []).find((a) => a.studentId === studentProfile?.id);

      driveJson.isEligible = eligibility.isEligible;
      driveJson.eligibilityReasons = eligibility.reasons;
      driveJson.hasApplied = Boolean(myApp);
      driveJson.applicationStatus = myApp ? myApp.status : null;

      return res.status(200).json({
        success: true,
        message: 'Drive fetched successfully',
        data: driveJson
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Drive fetched successfully',
      data: driveJson
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 58: Get all eligible students for a specific drive (TPO & Coordinator)
 */
const getEligibleStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getEligibleStudentsForDrive(id);

    return res.status(200).json({
      success: true,
      message: 'Eligible students retrieved successfully',
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update placement drive (TPO only)
 */
const updateDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const drive = await Drive.findByPk(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    const {
      companyName,
      role,
      description,
      ctc,
      minCgpa,
      maxActiveBacklogs,
      allowedBranches,
      minSemester,
      deadline,
      status
    } = req.body;

    if (companyName !== undefined) drive.companyName = companyName;
    if (role !== undefined) drive.role = role;
    if (description !== undefined) drive.description = description;
    if (ctc !== undefined) drive.ctc = ctc;
    if (minCgpa !== undefined) drive.minCgpa = minCgpa;
    if (maxActiveBacklogs !== undefined) drive.maxActiveBacklogs = maxActiveBacklogs;
    if (allowedBranches !== undefined) drive.allowedBranches = allowedBranches;
    if (minSemester !== undefined) drive.minSemester = minSemester;
    if (deadline !== undefined) drive.deadline = deadline;
    if (status !== undefined) drive.status = status;

    await drive.save();

    return res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully',
      data: drive
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete placement drive (TPO only)
 */
const deleteDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const drive = await Drive.findByPk(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    await drive.destroy();

    return res.status(200).json({
      success: true,
      message: 'Placement drive deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDrive,
  listDrives,
  getDriveById,
  getEligibleStudents,
  updateDrive,
  deleteDrive
};



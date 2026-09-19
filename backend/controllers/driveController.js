const { Op } = require('sequelize');
const { Drive, User, StudentProfile } = require('../models');
const { checkStudentEligibility } = require('../services/eligibilityService');

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
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { companyName: { [Op.like]: `%${search}%` } },
        { role: { [Op.like]: `%${search}%` } }
      ];
    }

    const drives = await Drive.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['deadline', 'ASC'], ['createdAt', 'DESC']]
    });

    // If student, annotate each drive with eligibility status
    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({
        where: { userId: req.user.id }
      });

      const formattedDrives = drives.map((drive) => {
        const driveJson = drive.toJSON ? drive.toJSON() : { ...drive };
        const eligibility = checkStudentEligibility(studentProfile, drive);
        driveJson.isEligible = eligibility.isEligible;
        driveJson.eligibilityReasons = eligibility.reasons;
        return driveJson;
      });

      return res.status(200).json({
        success: true,
        message: 'Drives fetched successfully',
        data: formattedDrives
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Drives fetched successfully',
      data: drives
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
    const drive = await Drive.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({
        where: { userId: req.user.id }
      });

      const driveJson = drive.toJSON ? drive.toJSON() : { ...drive };
      const eligibility = checkStudentEligibility(studentProfile, drive);
      driveJson.isEligible = eligibility.isEligible;
      driveJson.eligibilityReasons = eligibility.reasons;

      return res.status(200).json({
        success: true,
        message: 'Drive fetched successfully',
        data: driveJson
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Drive fetched successfully',
      data: drive
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDrive,
  listDrives,
  getDriveById
};


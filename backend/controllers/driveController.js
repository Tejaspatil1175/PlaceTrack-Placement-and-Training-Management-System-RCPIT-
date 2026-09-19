const { Drive, User, StudentProfile } = require('../models');

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

module.exports = {
  createDrive
};

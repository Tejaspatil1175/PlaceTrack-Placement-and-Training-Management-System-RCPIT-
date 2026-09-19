const { Application, Drive, StudentProfile, User } = require('../models');
const { checkStudentEligibility } = require('../services/eligibilityService');

/**
 * Step 60: Apply to a placement drive (Student only)
 */
const applyToDrive = async (req, res, next) => {
  try {
    const driveId = req.params.id || req.params.driveId || req.body.driveId;

    // 1. Fetch student profile
    const studentProfile = await StudentProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please complete your profile first.'
      });
    }

    // 2. Check resume
    if (!studentProfile.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume before applying for placement drives'
      });
    }

    // 3. Fetch Drive
    const drive = await Drive.findByPk(driveId);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    // 4. Server-side eligibility verification
    const eligibility = checkStudentEligibility(studentProfile, drive);
    if (!eligibility.isEligible) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible to apply for this drive',
        errors: eligibility.reasons
      });
    }

    // 5. Check duplicate application
    const existingApplication = await Application.findOne({
      where: {
        studentId: studentProfile.id,
        driveId: drive.id
      }
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this placement drive'
      });
    }

    // 6. Create Application
    const application = await Application.create({
      studentId: studentProfile.id,
      driveId: drive.id,
      status: 'APPLIED',
      appliedAt: new Date(),
      notes: req.body.notes || null
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully applied to placement drive',
      data: application
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 61: View student's own applications (Student only)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const applications = await Application.findAll({
      where: { studentId: studentProfile.id },
      include: [
        {
          model: Drive,
          as: 'drive'
        }
      ],
      order: [['appliedAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 62: Update application status (TPO & Coordinator)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Drive,
          as: 'drive'
        },
        {
          model: StudentProfile,
          as: 'studentProfile',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'prn', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    if (notes !== undefined) {
      application.notes = notes;
    }
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status} successfully`,
      data: application
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyToDrive,
  getMyApplications,
  updateApplicationStatus
};

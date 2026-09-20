const { Op } = require('sequelize');
const { Application, Drive, StudentProfile, User } = require('../models');
const { checkStudentEligibility } = require('../services/eligibilityService');
const { sendStatusUpdateEmail } = require('../services/emailService');

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
 * Step 62 & 67: Update application status and trigger email (TPO & Coordinator)
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

    // Step 67: Asynchronously send email notification to the student
    const studentUser = application.studentProfile?.user;
    const drive = application.drive;
    if (studentUser && studentUser.email) {
      sendStatusUpdateEmail({
        userEmail: studentUser.email,
        studentName: studentUser.name,
        companyName: drive ? drive.companyName : 'Placement Drive',
        role: drive ? drive.role : '',
        ctc: drive ? drive.ctc : null,
        status,
        notes: notes || application.notes
      }).catch(err => console.error('[Application Email Notification Error]:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status} successfully`,
      data: application
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 63 & 67: Bulk status update for applications and trigger email notifications (TPO & Coordinator)
 */
const bulkUpdateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationIds, status, notes } = req.body;

    const updateFields = { status };
    if (notes !== undefined) {
      updateFields.notes = notes;
    }

    // Step 67: Retrieve applications to notify students
    const applications = await Application.findAll({
      where: {
        id: {
          [Op.in]: applicationIds
        }
      },
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
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    const [affectedCount] = await Application.update(updateFields, {
      where: {
        id: {
          [Op.in]: applicationIds
        }
      }
    });

    // Send emails in background
    if (applications && applications.length > 0) {
      Promise.allSettled(
        applications.map(app => {
          const studentUser = app.studentProfile?.user;
          const drive = app.drive;
          if (studentUser && studentUser.email) {
            return sendStatusUpdateEmail({
              userEmail: studentUser.email,
              studentName: studentUser.name,
              companyName: drive ? drive.companyName : 'Placement Drive',
              role: drive ? drive.role : '',
              ctc: drive ? drive.ctc : null,
              status,
              notes: notes || app.notes
            });
          }
          return Promise.resolve();
        })
      ).catch(err => console.error('[Bulk Email Notification Error]:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${affectedCount} application(s) to status '${status}'`,
      data: {
        affectedCount,
        status
      }
    });
  } catch (error) {
    return next(error);
  }
};


/**
 * Get all applications for a specific drive (TPO & Coordinator)
 */
const getDriveApplications = async (req, res, next) => {
  try {
    const driveId = req.params.driveId || req.params.id;
    const { status } = req.query;

    const where = { driveId };
    if (status) {
      where.status = status;
    }

    const applications = await Application.findAll({
      where,
      include: [
        {
          model: StudentProfile,
          as: 'studentProfile',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'prn', 'name', 'email', 'phone', 'gender', 'category']
            }
          ]
        },
        {
          model: Drive,
          as: 'drive'
        }
      ],
      order: [['appliedAt', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Drive applications retrieved successfully',
      data: applications
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyToDrive,
  getMyApplications,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
  getDriveApplications
};

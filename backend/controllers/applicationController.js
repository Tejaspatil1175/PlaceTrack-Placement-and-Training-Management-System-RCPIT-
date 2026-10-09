const { Op } = require('sequelize');
const { Application, Drive, StudentProfile, User } = require('../models');
const { checkStudentEligibility } = require('../services/eligibilityService');
const { sendStatusUpdateEmail } = require('../services/emailService');

/**
 * Step 60: Apply to a placement drive (Student only)
 */
const applyToDrive = async (req, res, next) => {
  try {
    const rawDriveId = req.params.id || req.params.driveId || req.body?.driveId;
    const driveId = parseInt(rawDriveId, 10);

    if (!driveId || isNaN(driveId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid placement drive ID specified'
      });
    }

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

    // 2. Ensure resume link is present
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
        message: 'You are not eligible to apply for this drive: ' + eligibility.reasons.join(', '),
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
      notes: req.body?.notes || null
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

    const formatted = applications.map((app) => {
      const appJson = app.toJSON ? app.toJSON() : { ...app };
      return {
        id: appJson.id,
        studentId: appJson.studentId,
        driveId: appJson.driveId,
        companyName: appJson.drive?.companyName || 'Campus Placement',
        jobTitle: appJson.drive?.role || 'Software Engineer',
        ctc: appJson.drive?.ctc ? `${appJson.drive.ctc} LPA` : 'Competitive',
        appliedAt: appJson.appliedAt ? new Date(appJson.appliedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        updatedAt: appJson.updatedAt ? new Date(appJson.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: appJson.status,
        notes: appJson.notes,
        remarks: appJson.notes,
        drive: appJson.drive
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: formatted
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single application by ID with authorization checks
 */
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Department } = require('../models');

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
              attributes: ['id', 'prn', 'name', 'email', 'phone', 'gender', 'category', 'departmentId'],
              include: [
                {
                  model: Department,
                  as: 'department',
                  attributes: ['id', 'name']
                }
              ]
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

    // Role-based access control
    if (req.user.role === 'student') {
      if (application.studentProfile?.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own applications'
        });
      }
    } else if (req.user.role === 'coordinator') {
      const studentDeptId = application.studentProfile?.user?.departmentId;
      if (req.user.departmentId && studentDeptId !== req.user.departmentId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Application is outside your department scope'
        });
      }
    }

    const appJson = application.toJSON ? application.toJSON() : { ...application };
    const user = appJson.studentProfile?.user;

    const formatted = {
      id: appJson.id,
      studentId: appJson.studentId,
      studentName: user?.name || 'Student',
      prn: user?.prn || 'PRN',
      email: user?.email,
      phone: user?.phone,
      department: user?.department?.name || appJson.studentProfile?.branch || 'Engineering',
      branch: appJson.studentProfile?.branch,
      cgpa: appJson.studentProfile?.cgpa,
      activeBacklogs: appJson.studentProfile?.activeBacklogs,
      driveId: appJson.driveId,
      companyName: appJson.drive?.companyName || 'Campus Placement',
      jobTitle: appJson.drive?.role || 'Software Engineer',
      ctc: appJson.drive?.ctc ? `${appJson.drive.ctc} LPA` : 'Competitive',
      appliedAt: appJson.appliedAt ? new Date(appJson.appliedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      updatedAt: appJson.updatedAt ? new Date(appJson.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: appJson.status,
      notes: appJson.notes,
      remarks: appJson.notes,
      resumeUrl: appJson.studentProfile?.resumeUrl,
      drive: appJson.drive,
      studentProfile: appJson.studentProfile
    };

    return res.status(200).json({
      success: true,
      message: 'Application details retrieved successfully',
      data: formatted
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

/**
 * List all applications (TPO & Coordinator across college / department, Student self)
 */
const listApplications = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      return getMyApplications(req, res, next);
    }

    const { driveId, status, departmentId, search } = req.query;
    const { Department } = require('../models');
    const where = {};
    const userWhere = {};

    if (driveId && driveId !== 'all') {
      where.driveId = driveId;
    }

    if (status && status !== 'all') {
      let mappedStatus = status.toUpperCase();
      if (mappedStatus === 'INTERVIEW') mappedStatus = 'SHORTLISTED';
      if (mappedStatus === 'SELECTED') mappedStatus = 'ACCEPTED';
      where.status = mappedStatus;
    }

    if (req.user.role === 'coordinator') {
      userWhere.departmentId = req.user.departmentId;
    } else if (departmentId && departmentId !== 'all') {
      userWhere.departmentId = departmentId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { prn: { [Op.like]: `%${q}%` } }
      ];
    }

    const applications = await Application.findAll({
      where,
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
              where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
              attributes: ['id', 'prn', 'name', 'email', 'phone', 'gender', 'category', 'departmentId'],
              include: [
                {
                  model: Department,
                  as: 'department',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ],
      order: [['appliedAt', 'DESC'], ['createdAt', 'DESC']]
    });

    const formatted = applications.map((app) => {
      const appJson = app.toJSON ? app.toJSON() : { ...app };
      const user = appJson.studentProfile?.user;
      return {
        id: appJson.id,
        studentId: appJson.studentId,
        studentName: user?.name || 'Student',
        prn: user?.prn || 'PRN',
        email: user?.email,
        phone: user?.phone,
        department: user?.department?.name || appJson.studentProfile?.branch || 'Engineering',
        branch: appJson.studentProfile?.branch,
        cgpa: appJson.studentProfile?.cgpa,
        activeBacklogs: appJson.studentProfile?.activeBacklogs,
        driveId: appJson.driveId,
        companyName: appJson.drive?.companyName || 'Campus Placement',
        jobTitle: appJson.drive?.role || 'Software Engineer',
        ctc: appJson.drive?.ctc || '6.5 LPA',
        appliedAt: appJson.appliedAt || appJson.createdAt,
        updatedAt: appJson.updatedAt,
        status: appJson.status,
        notes: appJson.notes,
        remarks: appJson.notes,
        resumeUrl: appJson.studentProfile?.resumeUrl,
        drive: appJson.drive,
        studentProfile: appJson.studentProfile
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: formatted
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyToDrive,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
  getDriveApplications,
  listApplications
};

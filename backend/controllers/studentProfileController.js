const { User, StudentProfile, SemesterRecord, Department } = require('../models');
const { recalculateStudentAcademics } = require('../services/academicEngine');
const { uploadResumeBuffer } = require('../services/cloudinaryService');

/**
 * Upload student PDF resume to Cloudinary
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a valid PDF resume file'
      });
    }

    const studentProfile = await StudentProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const prnSafe = req.user.prn ? req.user.prn.replace(/[^a-zA-Z0-9]/g, '_') : `user_${req.user.id}`;
    const publicId = `resume_${prnSafe}_${Date.now()}`;

    const uploadResult = await uploadResumeBuffer(req.file.buffer, { publicId });

    studentProfile.resumeUrl = uploadResult.secureUrl;
    await studentProfile.save();

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded and linked to profile successfully',
      data: {
        resumeUrl: studentProfile.resumeUrl,
        publicId: uploadResult.publicId
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get own profile with cached CGPA & active backlogs (Student self-view)
 */
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: StudentProfile,
          as: 'studentProfile'
        }
      ]
    });

    if (!user || !user.studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student profile fetched successfully',
      data: {
        id: user.id,
        prn: user.prn,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        category: user.category,
        role: user.role,
        mustResetPassword: user.mustResetPassword,
        department: user.department,
        profile: {
          id: user.studentProfile.id,
          branch: user.studentProfile.branch,
          division: user.studentProfile.division,
          admissionYear: user.studentProfile.admissionYear,
          currentSemester: user.studentProfile.currentSemester,
          cgpa: parseFloat(user.studentProfile.cgpa),
          activeBacklogs: user.studentProfile.activeBacklogs,
          resumeUrl: user.studentProfile.resumeUrl,
          skills: user.studentProfile.skills || [],
          address: user.studentProfile.address
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Semester-wise breakdown / transcript view
 */
const getMyAcademics = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: SemesterRecord,
          as: 'semesterRecords'
        }
      ],
      order: [[{ model: SemesterRecord, as: 'semesterRecords' }, 'semesterNumber', 'ASC']]
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student academic records not found'
      });
    }

    const records = studentProfile.semesterRecords || [];

    return res.status(200).json({
      success: true,
      message: 'Semester records fetched successfully',
      data: {
        studentId: studentProfile.id,
        branch: studentProfile.branch,
        currentSemester: studentProfile.currentSemester,
        cgpa: parseFloat(studentProfile.cgpa),
        activeBacklogs: studentProfile.activeBacklogs,
        totalSemestersRecorded: records.length,
        semesterRecords: records.map(r => ({
          id: r.id,
          semesterNumber: r.semesterNumber,
          sgpa: parseFloat(r.sgpa),
          credits: r.credits,
          newBacklogs: r.newBacklogs,
          clearedBacklogs: r.clearedBacklogs,
          createdAt: r.createdAt
        }))
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update student self profile (Skills, address, phone only; academic fields locked)
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { skills, address, phone } = req.body;

    const studentProfile = await StudentProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Update StudentProfile fields
    if (skills !== undefined) {
      studentProfile.skills = Array.isArray(skills) ? skills : [skills];
    }
    if (address !== undefined) {
      studentProfile.address = address;
    }
    await studentProfile.save();

    // Update User phone if provided
    if (phone !== undefined) {
      const user = await User.findByPk(req.user.id);
      if (user) {
        user.phone = phone;
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        skills: studentProfile.skills,
        address: studentProfile.address,
        resumeUrl: studentProfile.resumeUrl
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Coordinator / TPO view department students (scoped for coordinators)
 */
const getDepartmentStudents = async (req, res, next) => {
  try {
    const departmentId = parseInt(req.params.id, 10);

    // Verify coordinator scope: coordinator can only access their own department
    if (req.user.role === 'coordinator' && req.user.departmentId !== departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view students from your assigned department'
      });
    }

    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const students = await User.findAll({
      where: {
        role: 'student',
        departmentId
      },
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: StudentProfile,
          as: 'studentProfile',
          include: [
            {
              model: SemesterRecord,
              as: 'semesterRecords'
            }
          ]
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      message: `Students for department '${department.name}' fetched successfully`,
      data: {
        department: {
          id: department.id,
          name: department.name
        },
        totalStudents: students.length,
        students
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Manual academic correction endpoint (TPO / Coordinator only)
 * Edits one SemesterRecord and re-triggers recalculateStudentAcademics
 */
const updateSemesterRecord = async (req, res, next) => {
  try {
    const studentIdentifier = req.params.id; // Can be studentProfileId or userId
    const semesterNumber = parseInt(req.params.num, 10);
    const { sgpa, credits, newBacklogs, clearedBacklogs } = req.body;

    if (isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester number must be between 1 and 8'
      });
    }

    // Find student profile by studentProfileId or userId
    let studentProfile = await StudentProfile.findByPk(studentIdentifier, {
      include: [{ model: User, as: 'user' }]
    });

    if (!studentProfile) {
      studentProfile = await StudentProfile.findOne({
        where: { userId: studentIdentifier },
        include: [{ model: User, as: 'user' }]
      });
    }

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Coordinator scoping check
    if (
      req.user.role === 'coordinator' &&
      studentProfile.user &&
      studentProfile.user.departmentId !== req.user.departmentId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only modify semester records for students in your department'
      });
    }

    // Find or create semester record
    let [semesterRecord] = await SemesterRecord.findOrCreate({
      where: {
        studentId: studentProfile.id,
        semesterNumber
      },
      defaults: {
        studentId: studentProfile.id,
        semesterNumber,
        sgpa: sgpa !== undefined ? sgpa : 0.00,
        credits: credits !== undefined ? credits : 0,
        newBacklogs: newBacklogs !== undefined ? newBacklogs : 0,
        clearedBacklogs: clearedBacklogs !== undefined ? clearedBacklogs : 0
      }
    });

    // Update fields if they were provided
    if (sgpa !== undefined) semesterRecord.sgpa = parseFloat(sgpa);
    if (credits !== undefined) semesterRecord.credits = parseInt(credits, 10);
    if (newBacklogs !== undefined) semesterRecord.newBacklogs = parseInt(newBacklogs, 10);
    if (clearedBacklogs !== undefined) semesterRecord.clearedBacklogs = parseInt(clearedBacklogs, 10);

    await semesterRecord.save();

    // Re-trigger recalculateStudentAcademics (Phase 4 engine)
    const recalculated = await recalculateStudentAcademics(studentProfile.id);

    return res.status(200).json({
      success: true,
      message: `Semester ${semesterNumber} record updated and academics recomputed successfully`,
      data: {
        semesterRecord,
        academics: {
          cgpa: recalculated.cgpa,
          activeBacklogs: recalculated.activeBacklogs
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  getMyAcademics,
  updateMyProfile,
  uploadResume,
  getDepartmentStudents,
  updateSemesterRecord
};

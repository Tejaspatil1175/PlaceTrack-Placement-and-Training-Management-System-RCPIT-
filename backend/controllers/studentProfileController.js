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
 * Semester-wise breakdown / transcript view (Student self or TPO / Coordinator by ID)
 */
const getMyAcademics = async (req, res, next) => {
  try {
    const studentIdentifier = req.params.id || 'me';
    let studentProfile = null;

    if (studentIdentifier === 'me') {
      studentProfile = await StudentProfile.findOne({
        where: { userId: req.user.id },
        include: [
          {
            model: SemesterRecord,
            as: 'semesterRecords'
          }
        ],
        order: [[{ model: SemesterRecord, as: 'semesterRecords' }, 'semesterNumber', 'ASC']]
      });
    } else {
      if (
        req.user.role === 'student' &&
        String(req.user.id) !== String(studentIdentifier) &&
        req.user.prn !== studentIdentifier
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view your own academic transcript'
        });
      }

      const { Op } = require('sequelize');
      studentProfile = await StudentProfile.findOne({
        where: {
          [Op.or]: [
            { id: isNaN(studentIdentifier) ? 0 : parseInt(studentIdentifier, 10) },
            { userId: isNaN(studentIdentifier) ? 0 : parseInt(studentIdentifier, 10) }
          ]
        },
        include: [
          { model: User, as: 'user' },
          { model: SemesterRecord, as: 'semesterRecords' }
        ],
        order: [[{ model: SemesterRecord, as: 'semesterRecords' }, 'semesterNumber', 'ASC']]
      });

      if (!studentProfile) {
        const userWithPrn = await User.findOne({ where: { prn: studentIdentifier } });
        if (userWithPrn) {
          studentProfile = await StudentProfile.findOne({
            where: { userId: userWithPrn.id },
            include: [
              { model: User, as: 'user' },
              { model: SemesterRecord, as: 'semesterRecords' }
            ],
            order: [[{ model: SemesterRecord, as: 'semesterRecords' }, 'semesterNumber', 'ASC']]
          });
        }
      }

      if (
        req.user.role === 'coordinator' &&
        studentProfile?.user &&
        studentProfile.user.departmentId !== req.user.departmentId
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view academic records for students in your department'
        });
      }
    }

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
        semesterRecords: records.map((r) => ({
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

const BRANCH_ALIAS_MAP = {
  computer: ['Computer Engineering', 'Computer'],
  'computer engineering': ['Computer Engineering', 'Computer'],
  it: ['Information Technology', 'IT'],
  'information technology': ['Information Technology', 'IT'],
  'ai&ds': ['Artificial Intelligence and Data Science', 'AI&DS', 'AI & DS', 'AIDS', 'Data Science'],
  'ai & ds': ['Artificial Intelligence and Data Science', 'AI&DS', 'AI & DS', 'AIDS', 'Data Science'],
  'artificial intelligence and data science': ['Artificial Intelligence and Data Science', 'AI&DS'],
  entc: ['Electronics and Telecommunication Engineering', 'ENTC', 'E&TC', 'Telecommunication'],
  'e&tc': ['Electronics and Telecommunication Engineering', 'ENTC', 'E&TC', 'Telecommunication'],
  'electronics and telecommunication engineering': ['Electronics and Telecommunication Engineering', 'ENTC'],
  mechanical: ['Mechanical Engineering', 'Mechanical'],
  'mechanical engineering': ['Mechanical Engineering', 'Mechanical'],
  civil: ['Civil Engineering', 'Civil'],
  'civil engineering': ['Civil Engineering', 'Civil'],
  electrical: ['Electrical Engineering', 'Electrical'],
  'electrical engineering': ['Electrical Engineering', 'Electrical']
};

/**
 * List all students with filtering, search, and pagination (TPO and Coordinator)
 */
const listStudents = async (req, res, next) => {
  try {
    const {
      search,
      departmentId,
      department,
      branch,
      admissionYear,
      cgpaMin,
      minCgpa,
      backlogStatus,
      maxBacklogs,
      placementStatus,
      page = 1,
      limit = 50
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (parsedPage - 1) * parsedLimit;

    const { Op } = require('sequelize');
    const { Application, SemesterRecord } = require('../models');

    const userWhere = { role: 'student' };
    const profileWhere = {};

    // Coordinator can only view students from their assigned department
    if (req.user.role === 'coordinator') {
      userWhere.departmentId = req.user.departmentId;
    } else if (departmentId && departmentId !== 'all') {
      userWhere.departmentId = departmentId;
    }

    // Search by name, email, or PRN
    if (search && search.trim()) {
      const q = search.trim();
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { prn: { [Op.like]: `%${q}%` } }
      ];
    }

    // Filter by branch or department name (supports aliases like IT, ENTC, AI&DS)
    const rawBranch = (branch || department || '').trim();
    if (rawBranch && rawBranch.toLowerCase() !== 'all') {
      const lookup = rawBranch.toLowerCase();
      const variations = BRANCH_ALIAS_MAP[lookup];
      if (variations && variations.length > 0) {
        profileWhere.branch = {
          [Op.or]: variations.map((v) => ({ [Op.like]: `%${v}%` }))
        };
      } else {
        profileWhere.branch = { [Op.like]: `%${rawBranch}%` };
      }
    }

    // Filter by admissionYear
    if (admissionYear && admissionYear !== 'all') {
      profileWhere.admissionYear = parseInt(admissionYear, 10);
    }

    // Filter by CGPA
    const effectiveMinCgpa = cgpaMin || minCgpa;
    if (effectiveMinCgpa && !isNaN(effectiveMinCgpa)) {
      profileWhere.cgpa = { [Op.gte]: parseFloat(effectiveMinCgpa) };
    }

    // Filter by active backlogs
    if (backlogStatus === '0' || backlogStatus === 'no_backlogs' || maxBacklogs === '0') {
      profileWhere.activeBacklogs = 0;
    } else if (backlogStatus === 'has_backlogs') {
      profileWhere.activeBacklogs = { [Op.gt]: 0 };
    } else if (backlogStatus !== undefined && backlogStatus !== '' && !isNaN(backlogStatus)) {
      profileWhere.activeBacklogs = { [Op.lte]: parseInt(backlogStatus, 10) };
    } else if (maxBacklogs !== undefined && maxBacklogs !== '' && !isNaN(maxBacklogs)) {
      profileWhere.activeBacklogs = { [Op.lte]: parseInt(maxBacklogs, 10) };
    }

    const { count, rows: students } = await User.findAndCountAll({
      where: userWhere,
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: StudentProfile,
          as: 'studentProfile',
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          required: Object.keys(profileWhere).length > 0,
          include: [
            {
              model: Application,
              as: 'applications',
              attributes: ['id', 'status', 'driveId']
            },
            {
              model: SemesterRecord,
              as: 'semesterRecords'
            }
          ]
        }
      ],
      order: [['name', 'ASC']],
      limit: parsedLimit,
      offset,
      distinct: true
    });

    const formattedStudents = students.map((student) => {
      const studentJson = student.toJSON ? student.toJSON() : { ...student };
      const applications = studentJson.studentProfile?.applications || [];
      let calculatedPlacementStatus = 'Unplaced';
      if (applications.some((a) => a.status === 'ACCEPTED')) {
        calculatedPlacementStatus = 'Placed';
      } else if (applications.some((a) => a.status === 'SHORTLISTED')) {
        calculatedPlacementStatus = 'Shortlisted';
      } else if (applications.some((a) => a.status === 'APPLIED')) {
        calculatedPlacementStatus = 'Applied';
      }
      studentJson.placementStatus = calculatedPlacementStatus;
      studentJson.semesterRecords = studentJson.studentProfile?.semesterRecords || [];
      studentJson.applications = applications;
      return studentJson;
    });

    let finalStudents = formattedStudents;
    if (placementStatus && placementStatus !== 'all') {
      finalStudents = formattedStudents.filter(
        (s) => s.placementStatus.toLowerCase() === placementStatus.toLowerCase()
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Students fetched successfully',
      data: {
        students: finalStudents,
        total: count,
        page: parsedPage,
        limit: parsedLimit
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get student by ID or PRN (TPO & Coordinator)
 */
const getStudentById = async (req, res, next) => {
  try {
    const studentIdentifier = req.params.id;
    const { Op } = require('sequelize');
    const { Application, Drive } = require('../models');

    let user = await User.findOne({
      where: {
        role: 'student',
        [Op.or]: [
          { id: isNaN(studentIdentifier) ? 0 : parseInt(studentIdentifier, 10) },
          { prn: studentIdentifier }
        ]
      },
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: StudentProfile,
          as: 'studentProfile',
          include: [
            {
              model: SemesterRecord,
              as: 'semesterRecords'
            },
            {
              model: Application,
              as: 'applications',
              include: [
                {
                  model: Drive,
                  as: 'drive',
                  attributes: ['id', 'companyName', 'role', 'ctc', 'status']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!user && !isNaN(studentIdentifier)) {
      const profile = await StudentProfile.findByPk(parseInt(studentIdentifier, 10));
      if (profile) {
        user = await User.findByPk(profile.userId, {
          attributes: { exclude: ['passwordHash'] },
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name']
            },
            {
              model: StudentProfile,
              as: 'studentProfile',
              include: [
                {
                  model: SemesterRecord,
                  as: 'semesterRecords'
                },
                {
                  model: Application,
                  as: 'applications',
                  include: [
                    {
                      model: Drive,
                      as: 'drive',
                      attributes: ['id', 'companyName', 'role', 'ctc', 'status']
                    }
                  ]
                }
              ]
            }
          ]
        });
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Coordinator department boundary enforcement
    if (req.user.role === 'coordinator' && user.departmentId !== req.user.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view students from your assigned department'
      });
    }

    const userJson = user.toJSON ? user.toJSON() : { ...user };
    const applications = userJson.studentProfile?.applications || [];
    let calculatedPlacementStatus = 'Unplaced';
    if (applications.some((a) => a.status === 'ACCEPTED')) {
      calculatedPlacementStatus = 'Placed';
    } else if (applications.some((a) => a.status === 'SHORTLISTED')) {
      calculatedPlacementStatus = 'Shortlisted';
    } else if (applications.some((a) => a.status === 'APPLIED')) {
      calculatedPlacementStatus = 'Applied';
    }
    userJson.placementStatus = calculatedPlacementStatus;
    userJson.semesterRecords = userJson.studentProfile?.semesterRecords || [];
    userJson.applications = applications;

    return res.status(200).json({
      success: true,
      message: 'Student details fetched successfully',
      data: userJson
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete student account (TPO only)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: {
        id,
        role: 'student'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'Student account deleted successfully'
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
  updateSemesterRecord,
  listStudents,
  getStudentById,
  deleteStudent
};


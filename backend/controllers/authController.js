const { Op } = require('sequelize');
const { User, Department, StudentProfile, sequelize } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

/**
 * Controller for user authentication
 */
const login = async (req, res, next) => {
  try {
    const identifier = req.body.identifier || req.body.email || req.body.prn;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (PRN or Email) and password are required'
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { prn: identifier }
        ]
      },
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

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/PRN or password'
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/PRN or password'
      });
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      prn: user.prn
    };

    const token = generateToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        mustResetPassword: user.mustResetPassword,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          prn: user.prn,
          phone: user.phone,
          role: user.role,
          mustResetPassword: user.mustResetPassword,
          department: user.department,
          studentProfile: user.studentProfile
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for forced password reset on first login or general password change
 */
const firstLoginReset = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the current password'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match'
      });
    }

    const newHash = await hashPassword(newPassword);
    user.passwordHash = newHash;
    user.mustResetPassword = false;
    await user.save();

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      prn: user.prn
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        token,
        mustResetPassword: false
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for user/student registration
 */
const register = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      email,
      password,
      prn,
      phone,
      departmentId,
      branch,
      division,
      admissionYear,
      currentSemester
    } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    if (prn) {
      const existingPrn = await User.findOne({ where: { prn } });
      if (existingPrn) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'An account with this PRN already exists'
        });
      }
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      prn: prn || null,
      phone: phone || null,
      role: 'student',
      departmentId: departmentId || null,
      passwordHash,
      mustResetPassword: false
    }, { transaction });

    let finalBranch = branch;
    if (!finalBranch && departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (dept) finalBranch = dept.name;
    }

    const studentProfile = await StudentProfile.create({
      userId: user.id,
      branch: finalBranch || 'Computer Engineering',
      division: division || 'A',
      admissionYear: admissionYear || new Date().getFullYear(),
      currentSemester: currentSemester || 1,
      cgpa: 0,
      activeBacklogs: 0
    }, { transaction });

    await transaction.commit();

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      prn: user.prn
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        mustResetPassword: false,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          prn: user.prn,
          phone: user.phone,
          role: user.role,
          departmentId: user.departmentId,
          studentProfile
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
};

/**
 * Controller to get current authenticated user profile
 */
const getMe = async (req, res, next) => {
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
  firstLoginReset,
  register,
  getMe
};

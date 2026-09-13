const { Op } = require('sequelize');
const { User, Department, StudentProfile } = require('../models');
const { comparePassword } = require('../utils/password');
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

module.exports = {
  login
};

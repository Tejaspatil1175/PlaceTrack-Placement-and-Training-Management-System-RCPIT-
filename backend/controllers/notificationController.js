const { Op } = require('sequelize');
const { Notification, User, Department, StudentProfile } = require('../models');
const { sendEmail } = require('../services/emailService');
const { getGenericNoticeTemplate } = require('../templates/emailTemplates');

/**
 * Step 68: Create/send notification endpoint (TPO & Coordinator)
 */
const createNotification = async (req, res, next) => {
  try {
    const {
      title,
      message,
      targetType = 'ALL',
      targetDepartmentId = null,
      type = 'GENERAL',
      sendEmailBroadcast = false
    } = req.body;

    const userRole = req.user.role;
    let finalTargetType = targetType;
    let finalTargetDepartmentId = targetDepartmentId;

    // RBAC Scoping: Coordinator can only target their own department
    if (userRole === 'coordinator') {
      finalTargetType = 'DEPARTMENT';
      finalTargetDepartmentId = req.user.departmentId;

      if (!finalTargetDepartmentId) {
        return res.status(400).json({
          success: false,
          message: 'Coordinator is not assigned to any department'
        });
      }
    } else if (finalTargetType === 'DEPARTMENT' && !finalTargetDepartmentId) {
      return res.status(400).json({
        success: false,
        message: 'targetDepartmentId is required when targetType is DEPARTMENT'
      });
    }

    // Verify department exists if specified
    if (finalTargetDepartmentId) {
      const department = await Department.findByPk(finalTargetDepartmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: `Department with ID ${finalTargetDepartmentId} not found`
        });
      }
    }

    // Create Notification record
    const notification = await Notification.create({
      title,
      message,
      targetType: finalTargetType,
      targetDepartmentId: finalTargetDepartmentId,
      sentBy: req.user.id,
      type
    });

    // Optionally broadcast via email
    if (sendEmailBroadcast) {
      const userWhere = {};
      if (finalTargetType === 'DEPARTMENT') {
        userWhere.departmentId = finalTargetDepartmentId;
      } else if (finalTargetType === 'STUDENTS') {
        userWhere.role = 'student';
      } else if (finalTargetType === 'COORDINATORS') {
        userWhere.role = 'coordinator';
      }

      // Fetch recipient emails
      User.findAll({
        where: userWhere,
        attributes: ['id', 'name', 'email']
      }).then(recipients => {
        const emailRecipients = recipients.filter(u => u.email).map(u => u.email);
        if (emailRecipients.length > 0) {
          const template = getGenericNoticeTemplate({ title, message });
          sendEmail({
            to: emailRecipients,
            subject: template.subject,
            html: template.html,
            text: template.text
          }).catch(err => console.error('[Notification Broadcast Email Error]:', err.message));
        }
      }).catch(err => console.error('[Notification Recipient Query Error]:', err.message));
    }

    return res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 69: List notifications for current user/student (GET /api/notifications/me)
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const departmentId = req.user.departmentId;

    let targetConditions = [];

    if (userRole === 'student') {
      targetConditions = [
        { targetType: 'ALL' },
        { targetType: 'STUDENTS' }
      ];
      if (departmentId) {
        targetConditions.push({
          targetType: 'DEPARTMENT',
          targetDepartmentId: departmentId
        });
      }
    } else if (userRole === 'coordinator') {
      targetConditions = [
        { targetType: 'ALL' },
        { targetType: 'COORDINATORS' }
      ];
      if (departmentId) {
        targetConditions.push({
          targetType: 'DEPARTMENT',
          targetDepartmentId: departmentId
        });
      }
    } else {
      // TPO sees all
      targetConditions = [
        { targetType: 'ALL' },
        { targetType: 'STUDENTS' },
        { targetType: 'COORDINATORS' },
        { targetType: 'DEPARTMENT' }
      ];
    }

    const notifications = await Notification.findAll({
      where: {
        [Op.or]: targetConditions
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Department,
          as: 'targetDepartment',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * List all notifications (TPO and Coordinator)
 * GET /api/notifications
 */
const listNotifications = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const where = {};

    if (userRole === 'coordinator') {
      where[Op.or] = [
        { sentBy: req.user.id },
        { targetType: 'DEPARTMENT', targetDepartmentId: req.user.departmentId },
        { targetType: 'ALL' }
      ];
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Department,
          as: 'targetDepartment',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications list retrieved successfully',
      data: notifications
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  listNotifications
};


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

module.exports = {
  createNotification
};

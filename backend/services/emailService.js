const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

/**
 * Initialize or get the Nodemailer transporter instance
 */
const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // Check if credentials exist
  if (env.email.user && env.email.pass) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465, // true for 465, false for other ports
      auth: {
        user: env.email.user,
        pass: env.email.pass
      }
    });
  } else {
    // If no credentials provided (e.g. local development / test without env set), create a dummy or stream transporter
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }

  return transporter;
};

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject line
 * @param {string} [options.html] - HTML body content
 * @param {string} [options.text] - Plain text body content
 * @param {Array} [options.attachments] - Optional email attachments
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    if (!to) {
      throw new Error('Recipient email address (to) is required');
    }
    if (!subject) {
      throw new Error('Email subject is required');
    }

    const mailOptions = {
      from: env.email.from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
      html: html || text,
      attachments
    };

    const currentTransporter = getTransporter();
    const info = await currentTransporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Email Service] Sent email to ${mailOptions.to} (Subject: "${subject}") - MessageID: ${info.messageId || 'mock'}`);
    }

    return {
      success: true,
      messageId: info.messageId || 'mock-id'
    };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify transporter connectivity
 */
const verifyTransporter = async () => {
  try {
    const currentTransporter = getTransporter();
    await currentTransporter.verify();
    return { success: true, message: 'SMTP connection established successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Reset transporter instance (useful for unit tests)
 */
const resetTransporter = () => {
  transporter = null;
};

module.exports = {
  getTransporter,
  sendEmail,
  verifyTransporter,
  resetTransporter
};

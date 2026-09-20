const nodemailer = require('nodemailer');
const { sendEmail, getTransporter, resetTransporter } = require('../services/emailService');

describe('Email Service Tests', () => {
  beforeEach(() => {
    resetTransporter();
    jest.clearAllMocks();
  });

  it('should successfully send an email using transporter', async () => {
    const result = await sendEmail({
      to: 'student@rcpit.ac.in',
      subject: 'Test Subject',
      html: '<h1>Hello Student</h1>',
      text: 'Hello Student'
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('should handle array of recipients correctly', async () => {
    const result = await sendEmail({
      to: ['student1@rcpit.ac.in', 'student2@rcpit.ac.in'],
      subject: 'Broadcast Notice',
      text: 'General Announcement'
    });

    expect(result.success).toBe(true);
  });

  it('should return error when "to" recipient is missing', async () => {
    const result = await sendEmail({
      subject: 'No recipient'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Recipient email address');
  });

  it('should return error when "subject" is missing', async () => {
    const result = await sendEmail({
      to: 'student@rcpit.ac.in'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Email subject is required');
  });
});

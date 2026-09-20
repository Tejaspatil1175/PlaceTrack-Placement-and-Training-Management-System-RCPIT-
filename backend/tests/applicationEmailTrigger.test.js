const { sendStatusUpdateEmail } = require('../services/emailService');

jest.mock('../services/emailService', () => {
  const originalModule = jest.requireActual('../services/emailService');
  return {
    ...originalModule,
    sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'mock-123' })
  };
});

describe('Application Status Change Email Trigger Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger selection email when status is ACCEPTED', async () => {
    const result = await sendStatusUpdateEmail({
      userEmail: 'student@rcpit.ac.in',
      studentName: 'Tejas Patil',
      companyName: 'Infosys',
      role: 'Software Engineer',
      ctc: 6.5,
      status: 'ACCEPTED',
      notes: 'Congrats on being selected!'
    });

    expect(result.success).toBe(true);
  });

  it('should trigger rejection email when status is REJECTED', async () => {
    const result = await sendStatusUpdateEmail({
      userEmail: 'student@rcpit.ac.in',
      studentName: 'Tejas Patil',
      companyName: 'Wipro',
      role: 'Project Engineer',
      status: 'REJECTED',
      notes: 'Good attempt, keep practicing'
    });

    expect(result.success).toBe(true);
  });

  it('should trigger shortlist email when status is SHORTLISTED', async () => {
    const result = await sendStatusUpdateEmail({
      userEmail: 'student@rcpit.ac.in',
      studentName: 'Tejas Patil',
      companyName: 'Capgemini',
      role: 'Analyst',
      status: 'SHORTLISTED',
      notes: 'Round 2 scheduled tomorrow'
    });

    expect(result.success).toBe(true);
  });
});

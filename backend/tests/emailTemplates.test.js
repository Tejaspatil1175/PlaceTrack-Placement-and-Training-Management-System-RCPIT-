const {
  getSelectionEmailTemplate,
  getRejectionEmailTemplate,
  getShortlistEmailTemplate,
  getGenericNoticeTemplate
} = require('../templates/emailTemplates');

describe('Email Templates Test Suite', () => {
  it('should generate selection email with correct details', () => {
    const data = {
      studentName: 'Rahul Sharma',
      companyName: 'Tata Consultancy Services',
      role: 'Software Engineer',
      ctc: 7.5,
      notes: 'Reporting date is Oct 15th'
    };

    const template = getSelectionEmailTemplate(data);
    expect(template.subject).toContain('Selected');
    expect(template.subject).toContain('Tata Consultancy Services');
    expect(template.html).toContain('Rahul Sharma');
    expect(template.html).toContain('7.5 LPA');
    expect(template.html).toContain('Reporting date is Oct 15th');
    expect(template.text).toContain('Tata Consultancy Services');
  });

  it('should generate rejection email template', () => {
    const data = {
      studentName: 'Priya Patil',
      companyName: 'Infosys',
      role: 'Systems Engineer',
      notes: 'Technical round feedback'
    };

    const template = getRejectionEmailTemplate(data);
    expect(template.subject).toContain('Infosys');
    expect(template.html).toContain('Priya Patil');
    expect(template.html).toContain('Not Selected');
    expect(template.html).toContain('Technical round feedback');
    expect(template.text).toContain('Infosys');
  });

  it('should generate shortlist email template', () => {
    const data = {
      studentName: 'Amit Verma',
      companyName: 'Persistent Systems',
      role: 'Associate Developer',
      notes: 'Interview scheduled at 10 AM on Monday'
    };

    const template = getShortlistEmailTemplate(data);
    expect(template.subject).toContain('Shortlisted');
    expect(template.subject).toContain('Persistent Systems');
    expect(template.html).toContain('Amit Verma');
    expect(template.html).toContain('10 AM on Monday');
  });

  it('should generate generic notice email template', () => {
    const data = {
      title: 'Resume Building Workshop',
      message: 'A mandatory workshop will be held in Auditorium 2 on Friday.',
      studentName: 'Sneha Kulkarni'
    };

    const template = getGenericNoticeTemplate(data);
    expect(template.subject).toContain('Resume Building Workshop');
    expect(template.html).toContain('Resume Building Workshop');
    expect(template.html).toContain('Sneha Kulkarni');
    expect(template.text).toContain('Auditorium 2');
  });
});

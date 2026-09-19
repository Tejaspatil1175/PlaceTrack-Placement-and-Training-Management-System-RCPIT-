const request = require('supertest');

jest.mock('../models', () => ({
  Application: {
    findOne: jest.fn(),
    create: jest.fn()
  },
  Drive: {
    findByPk: jest.fn()
  },
  StudentProfile: {
    findOne: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  Department: {}
}));

const { app } = require('../server');
const { Application, Drive, StudentProfile, User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('POST /api/drives/:id/apply (Apply to Drive)', () => {
  let studentToken;
  let tpoToken;

  const validDrive = {
    id: 1,
    companyName: 'Wipro',
    role: 'Project Engineer',
    minCgpa: 6.5,
    maxActiveBacklogs: 0,
    allowedBranches: ['Computer Engineering'],
    minSemester: 7,
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'UPCOMING'
  };

  const eligibleProfile = {
    id: 10,
    userId: 5,
    branch: 'Computer Engineering',
    cgpa: '8.00',
    activeBacklogs: 0,
    currentSemester: 7,
    resumeUrl: 'https://cloudinary.com/rcpit/resumes/resume.pdf'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    studentToken = generateToken({ id: 5, role: 'student', email: 'stu@rcpit.ac.in' });
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
  });

  it('should return 401 if unauthenticated', async () => {
    const res = await request(app).post('/api/drives/1/apply').send({});
    expect(res.status).toBe(401);
  });

  it('should return 403 if called by non-student', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });

    const res = await request(app)
      .post('/api/drives/1/apply')
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({});

    expect(res.status).toBe(403);
  });

  it('should return 400 if student has not uploaded a resume', async () => {
    User.findByPk.mockResolvedValue({ id: 5, role: 'student', email: 'stu@rcpit.ac.in' });
    StudentProfile.findOne.mockResolvedValue({
      ...eligibleProfile,
      resumeUrl: null
    });

    const res = await request(app)
      .post('/api/drives/1/apply')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Please upload your resume');
  });

  it('should return 404 if drive does not exist', async () => {
    User.findByPk.mockResolvedValue({ id: 5, role: 'student', email: 'stu@rcpit.ac.in' });
    StudentProfile.findOne.mockResolvedValue(eligibleProfile);
    Drive.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/drives/999/apply')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    expect(res.status).toBe(404);
  });

  it('should return 400 if student is not eligible', async () => {
    User.findByPk.mockResolvedValue({ id: 5, role: 'student', email: 'stu@rcpit.ac.in' });
    StudentProfile.findOne.mockResolvedValue({
      ...eligibleProfile,
      cgpa: '5.50' // Below 6.5
    });
    Drive.findByPk.mockResolvedValue(validDrive);

    const res = await request(app)
      .post('/api/drives/1/apply')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not eligible');
  });

  it('should return 409 if student has already applied', async () => {
    User.findByPk.mockResolvedValue({ id: 5, role: 'student', email: 'stu@rcpit.ac.in' });
    StudentProfile.findOne.mockResolvedValue(eligibleProfile);
    Drive.findByPk.mockResolvedValue(validDrive);
    Application.findOne.mockResolvedValue({ id: 100, studentId: 10, driveId: 1 });

    const res = await request(app)
      .post('/api/drives/1/apply')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already applied');
  });

  it('should successfully apply and return 201', async () => {
    User.findByPk.mockResolvedValue({ id: 5, role: 'student', email: 'stu@rcpit.ac.in' });
    StudentProfile.findOne.mockResolvedValue(eligibleProfile);
    Drive.findByPk.mockResolvedValue(validDrive);
    Application.findOne.mockResolvedValue(null);
    Application.create.mockResolvedValue({
      id: 50,
      studentId: 10,
      driveId: 1,
      status: 'APPLIED',
      appliedAt: new Date()
    });

    const res = await request(app)
      .post('/api/drives/1/apply')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ notes: 'Looking forward to the process' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPLIED');
    expect(Application.create).toHaveBeenCalledTimes(1);
  });
});

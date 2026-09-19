const request = require('supertest');

jest.mock('../models', () => ({
  Drive: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  StudentProfile: {
    findOne: jest.fn()
  }
}));

const { app } = require('../server');
const { Drive, User, StudentProfile } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('GET /api/drives (List Drives)', () => {
  let tpoToken;
  let studentToken;

  const mockDrives = [
    {
      id: 1,
      companyName: 'Infosys',
      role: 'Specialist Programmer',
      ctc: 9.5,
      minCgpa: 7.5,
      maxActiveBacklogs: 0,
      allowedBranches: ['Computer Engineering'],
      minSemester: 7,
      deadline: '2026-12-31T00:00:00.000Z',
      status: 'UPCOMING',
      creator: { id: 1, name: 'TPO Admin', email: 'tpo@rcpit.ac.in' },
      toJSON: function() { return { ...this }; }
    },
    {
      id: 2,
      companyName: 'Capgemini',
      role: 'Analyst',
      ctc: 4.5,
      minCgpa: 6.0,
      maxActiveBacklogs: 1,
      allowedBranches: ['Computer Engineering', 'Information Technology'],
      minSemester: 7,
      deadline: '2026-12-31T00:00:00.000Z',
      status: 'UPCOMING',
      creator: { id: 1, name: 'TPO Admin', email: 'tpo@rcpit.ac.in' },
      toJSON: function() { return { ...this }; }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    studentToken = generateToken({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });
  });

  it('should return 401 if unauthenticated', async () => {
    const res = await request(app).get('/api/drives');
    expect(res.status).toBe(401);
  });

  it('should list all drives for TPO without eligibility calculation', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    Drive.findAll.mockResolvedValue(mockDrives);

    const res = await request(app)
      .get('/api/drives')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].companyName).toBe('Infosys');
  });

  it('should list drives with eligibility annotations for Student', async () => {
    User.findByPk.mockResolvedValue({ id: 3, role: 'student', email: 'student@rcpit.ac.in' });
    Drive.findAll.mockResolvedValue(mockDrives);
    StudentProfile.findOne.mockResolvedValue({
      id: 10,
      userId: 3,
      branch: 'Information Technology',
      currentSemester: 7,
      cgpa: '8.00',
      activeBacklogs: 0
    });

    const res = await request(app)
      .get('/api/drives')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);

    // Infosys: student branch is IT, but only Computer Engineering allowed
    const infosysDrive = res.body.data.find(d => d.companyName === 'Infosys');
    expect(infosysDrive.isEligible).toBe(false);
    expect(infosysDrive.eligibilityReasons).toContain("Branch 'Information Technology' is not eligible for this drive");

    // Capgemini: student is IT, CGPA 8.0 >= 6.0, backlogs 0 <= 1, sem 7 >= 7
    const capgeminiDrive = res.body.data.find(d => d.companyName === 'Capgemini');
    expect(capgeminiDrive.isEligible).toBe(true);
    expect(capgeminiDrive.eligibilityReasons.length).toBe(0);
  });

  it('should fetch single drive by ID', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    Drive.findByPk.mockResolvedValue(mockDrives[0]);

    const res = await request(app)
      .get('/api/drives/1')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.companyName).toBe('Infosys');
  });

  it('should return 404 if drive does not exist', async () => {
    User.findByPk.mockResolvedValue({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    Drive.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/drives/999')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

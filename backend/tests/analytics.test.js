const request = require('supertest');

jest.mock('../services/analyticsService', () => ({
  getTpoPlacementAnalytics: jest.fn().mockResolvedValue({
    stats: {
      totalStudents: 540,
      activeDrives: 24,
      totalApplications: 1280,
      studentsPlaced: 185,
      placementRate: 68.5
    },
    branchWisePlacement: [],
    yearlyTrend: [],
    upcomingDrives: [],
    departmentSnapshots: [],
    recentActivities: []
  }),
  getCoordinatorPlacementAnalytics: jest.fn().mockResolvedValue({
    stats: {
      deptStudents: 120,
      activeDrives: 18,
      pendingShortlists: 42,
      placedStudents: 48,
      placementRate: 40.0
    },
    divisionPlacement: [],
    yearlyTrend: [],
    upcomingDrives: [],
    recentActivities: []
  }),
  generatePlacementReportData: jest.fn().mockResolvedValue([
    {
      prn: '202101001',
      name: 'Rahul Sharma',
      email: 'rahul@rcpit.ac.in',
      phone: '9876543210',
      department: 'Computer',
      branch: 'Computer',
      division: 'A',
      admissionYear: 2021,
      currentSemester: 7,
      cgpa: '8.50',
      activeBacklogs: 0,
      placementStatus: 'Placed',
      placedCompany: 'TCS',
      package: '7.0 LPA'
    }
  ])
}));

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn()
  },
  StudentProfile: {},
  Department: {}
}));

const { app } = require('../server');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Analytics & Reports Endpoints (Phase 13)', () => {
  let tpoToken;
  let coordinatorToken;
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    coordinatorToken = generateToken({ id: 2, role: 'coordinator', departmentId: 1, email: 'coord@rcpit.ac.in' });
    studentToken = generateToken({ id: 10, role: 'student', email: 'student@rcpit.ac.in' });

    User.findByPk.mockImplementation((id) => {
      if (id === 1) return Promise.resolve({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
      if (id === 2) return Promise.resolve({ id: 2, role: 'coordinator', departmentId: 1, email: 'coord@rcpit.ac.in' });
      if (id === 10) return Promise.resolve({ id: 10, role: 'student', email: 'student@rcpit.ac.in' });
      return Promise.resolve(null);
    });
  });

  describe('GET /api/analytics/tpo (Step 75)', () => {
    it('should return college-wide overview for TPO', async () => {
      const res = await request(app)
        .get('/api/analytics/tpo')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.totalStudents).toBe(540);
    });

    it('should forbid student from accessing TPO analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/tpo')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/analytics/coordinator (Step 76)', () => {
    it('should return department analytics for coordinator', async () => {
      const res = await request(app)
        .get('/api/analytics/coordinator')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.deptStudents).toBe(120);
    });
  });

  describe('GET /api/analytics/report/download (Step 78)', () => {
    it('should export CSV report for TPO', async () => {
      const res = await request(app)
        .get('/api/analytics/report/download')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('PRN,Student Name');
      expect(res.text).toContain('202101001');
    });

    it('should allow JSON format export', async () => {
      const res = await request(app)
        .get('/api/analytics/report/download?format=json')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });
});

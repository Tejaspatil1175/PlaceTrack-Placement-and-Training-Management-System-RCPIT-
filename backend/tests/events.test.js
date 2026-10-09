const request = require('supertest');

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn()
  },
  Department: {
    findByPk: jest.fn()
  },
  Event: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  StudentProfile: {}
}));

const { app } = require('../server');
const { User, Event } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Events Management Endpoints (Phase 12)', () => {
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

  describe('POST /api/events (Step 71)', () => {
    it('should allow TPO to schedule a college-wide event', async () => {
      Event.create.mockResolvedValue({ id: 100 });
      Event.findByPk.mockResolvedValue({
        id: 100,
        title: 'Masterclass on System Design',
        type: 'Workshop',
        date: '2026-10-15',
        audienceScope: 'college_wide',
        creator: { id: 1, name: 'Admin TPO' }
      });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          title: 'Masterclass on System Design',
          type: 'Workshop',
          date: '2026-10-15',
          time: '10:00 AM',
          location: 'Seminar Hall B',
          audienceScope: 'college_wide'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Masterclass on System Design');
    });

    it('should allow coordinator to schedule a department-scoped event', async () => {
      Event.create.mockResolvedValue({ id: 101 });
      Event.findByPk.mockResolvedValue({
        id: 101,
        title: 'Mock Interview Prep',
        type: 'Mock Interview',
        date: '2026-10-20',
        audienceScope: 'my_department',
        departmentId: 1
      });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          title: 'Mock Interview Prep',
          type: 'Mock Interview',
          date: '2026-10-20'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          audienceScope: 'my_department',
          departmentId: 1,
          createdBy: 2
        })
      );
    });

    it('should reject student with 403', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Unauthorized Event', date: '2026-10-20' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/events (Step 72)', () => {
    it('should list all events for authenticated users', async () => {
      Event.findAll.mockResolvedValue([
        { id: 1, title: 'Workshop 1', type: 'Workshop', date: '2026-10-15' },
        { id: 2, title: 'Talk 1', type: 'Industry Talk', date: '2026-10-18' }
      ]);

      const res = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should allow TPO to update an event', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      Event.findByPk.mockResolvedValue({
        id: 1,
        title: 'Old Title',
        save: mockSave
      });

      const res = await request(app)
        .put('/api/events/1')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({ title: 'New Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should allow TPO to delete an event', async () => {
      const mockDestroy = jest.fn().mockResolvedValue(true);
      Event.findByPk.mockResolvedValue({
        id: 1,
        destroy: mockDestroy
      });

      const res = await request(app)
        .delete('/api/events/1')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockDestroy).toHaveBeenCalled();
    });
  });
});

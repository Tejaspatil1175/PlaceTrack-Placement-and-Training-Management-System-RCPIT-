const request = require('supertest');

jest.mock('../models', () => {
  const mockSequelize = {
    transaction: jest.fn(async (callback) => callback({})),
    Sequelize: {
      Op: {
        or: Symbol('or')
      }
    }
  };

  return {
    sequelize: mockSequelize,
    User: {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn()
    },
    StudentProfile: {
      create: jest.fn()
    },
    SemesterRecord: {
      findOne: jest.fn(),
      create: jest.fn()
    },
    Department: {
      findOne: jest.fn()
    },
    ExcelUploadLog: {
      create: jest.fn(),
      findAll: jest.fn()
    }
  };
});

jest.mock('../services/academicEngine', () => ({
  recalculateStudentAcademics: jest.fn().mockResolvedValue({ cgpa: 8.5, activeBacklogs: 0 })
}));

const { app } = require('../server');
const { User, ExcelUploadLog, Department, StudentProfile, SemesterRecord } = require('../models');
const { generateToken } = require('../utils/jwt');
const { generateStudentTemplateWorkbook } = require('../utils/excelTemplateGenerator');

describe('Student Bulk Upload & Delta Endpoints', () => {
  let tpoToken;
  let studentToken;
  let validExcelBuffer;

  beforeAll(async () => {
    const workbook = await generateStudentTemplateWorkbook();
    validExcelBuffer = await workbook.xlsx.writeBuffer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    tpoToken = generateToken({ id: 1, role: 'tpo', email: 'tpo@rcpit.ac.in' });
    studentToken = generateToken({ id: 2, role: 'student', email: 'student@rcpit.ac.in' });
  });

  describe('GET /api/students/template', () => {
    it('should allow downloading the excel template without auth', async () => {
      const res = await request(app).get('/api/students/template');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('spreadsheetml');
      expect(res.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('POST /api/students/bulk-upload (Steps 44 & 46)', () => {
    it('should reject unauthorized or student users with 403', async () => {
      User.findByPk.mockResolvedValue({ id: 2, role: 'student' });

      const res = await request(app)
        .post('/api/students/bulk-upload')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', validExcelBuffer, 'students.xlsx');

      expect(res.status).toBe(403);
    });

    it('should successfully process bulk upload for TPO and log results', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      User.findOne.mockResolvedValue(null);
      Department.findOne.mockResolvedValue({ id: 1, name: 'Computer' });
      User.create.mockResolvedValue({ id: 101, prn: '202101001', name: 'Aarav Sharma', email: 'aarav@rcpit.ac.in' });
      StudentProfile.create.mockResolvedValue({ id: 55, userId: 101 });
      SemesterRecord.create.mockResolvedValue({ id: 201 });
      ExcelUploadLog.create.mockResolvedValue({
        id: 1,
        fileName: 'students.xlsx',
        totalRows: 2,
        successCount: 2,
        errorCount: 0,
        uploadType: 'full'
      });

      const res = await request(app)
        .post('/api/students/bulk-upload')
        .set('Authorization', `Bearer ${tpoToken}`)
        .attach('file', validExcelBuffer, 'students.xlsx');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRows).toBe(2);
      expect(res.body.data.successCount).toBe(2);
      expect(ExcelUploadLog.create).toHaveBeenCalled();
    });
  });

  describe('GET /api/students/upload-logs (Step 45)', () => {
    it('should return list of upload history logs', async () => {
      User.findByPk.mockResolvedValue({ id: 1, role: 'tpo' });
      ExcelUploadLog.findAll.mockResolvedValue([
        {
          id: 1,
          fileName: 'batch2024.xlsx',
          totalRows: 150,
          successCount: 150,
          errorCount: 0,
          uploadType: 'full',
          uploader: { id: 1, name: 'TPO Admin' }
        }
      ]);

      const res = await request(app)
        .get('/api/students/upload-logs')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].fileName).toBe('batch2024.xlsx');
    });
  });
});

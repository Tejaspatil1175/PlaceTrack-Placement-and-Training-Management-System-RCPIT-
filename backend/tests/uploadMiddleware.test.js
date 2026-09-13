const express = require('express');
const request = require('supertest');
const { uploadExcel } = require('../middleware/upload');

const app = express();
app.post('/test-upload', uploadExcel('file'), (req, res) => {
  res.status(200).json({
    success: true,
    fileReceived: req.file.originalname,
    bufferSize: req.file.buffer.length
  });
});

describe('Upload Middleware', () => {
  it('should reject non-excel file extensions with 400', async () => {
    const res = await request(app)
      .post('/test-upload')
      .attach('file', Buffer.from('dummy content'), 'document.pdf');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Only .xlsx');
  });

  it('should accept valid .xlsx file attachment', async () => {
    const fakeExcelBuffer = Buffer.from('PK\x03\x04 fake zip excel content');
    const res = await request(app)
      .post('/test-upload')
      .attach('file', fakeExcelBuffer, 'students.xlsx');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.fileReceived).toBe('students.xlsx');
  });

  it('should return 400 if no file is sent in request', async () => {
    const res = await request(app).post('/test-upload');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('No file uploaded');
  });
});

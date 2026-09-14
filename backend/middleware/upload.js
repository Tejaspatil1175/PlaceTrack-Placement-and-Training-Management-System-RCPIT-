const multer = require('multer');
const path = require('path');

// Configure memory storage
const storage = multer.memoryStorage();

// File filter to restrict uploads to .xlsx spreadsheets
const excelFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream'
  ];

  if (ext === '.xlsx' || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only .xlsx Excel files are allowed');
    error.statusCode = 400;
    cb(error, false);
  }
};

// File filter for student resumes (PDF preferred, DOC/DOCX supported)
const resumeFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream'
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only PDF or Word documents (.pdf, .doc, .docx) are allowed for resumes');
    error.statusCode = 400;
    cb(error, false);
  }
};

const excelUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: excelFileFilter
});

const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: resumeFileFilter
});

/**
 * Middleware for single excel file upload with clean error handling
 */
const uploadExcel = (fieldName = 'file') => {
  const singleUpload = excelUpload.single(fieldName);

  return (req, res, next) => {
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds the 10MB limit'
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Invalid file uploaded'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please attach an .xlsx Excel file.'
        });
      }

      return next();
    });
  };
};

/**
 * Middleware for single resume upload (PDF/DOCX)
 */
const uploadResume = (fieldName = 'resume') => {
  const singleUpload = resumeUpload.single(fieldName);

  return (req, res, next) => {
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Resume file size exceeds the 5MB limit'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Resume upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Invalid resume format'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No resume file uploaded. Please attach a .pdf file.'
        });
      }

      return next();
    });
  };
};

module.exports = {
  upload: excelUpload,
  uploadExcel,
  uploadResume
};

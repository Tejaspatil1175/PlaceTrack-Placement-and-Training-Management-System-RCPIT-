const { ExcelUploadLog, User } = require('../models');
const { parseExcelBuffer } = require('../services/excelParser');
const { ingestStudentRows } = require('../services/bulkStudentService');
const { generateStudentTemplateWorkbook } = require('../utils/excelTemplateGenerator');

/**
 * Handles Excel bulk student upload and delta semester updates.
 */
const bulkUploadStudents = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid .xlsx file'
      });
    }

    const isDelta = req.query.mode === 'delta' || req.body.isDelta === 'true' || req.body.isDelta === true;

    // Parse workbook
    const parseResult = await parseExcelBuffer(req.file.buffer, isDelta);

    if (!parseResult.rows || parseResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded Excel file contains no student data rows'
      });
    }

    // Ingest student rows transactionally
    const ingestionResult = await ingestStudentRows(parseResult.rows, {
      uploadedById: req.user ? req.user.id : null,
      isDelta
    });

    // Audit log in database
    const uploadLog = await ExcelUploadLog.create({
      uploadedBy: req.user ? req.user.id : 1,
      fileName: req.file.originalname || 'students.xlsx',
      totalRows: ingestionResult.totalRows,
      successCount: ingestionResult.successCount,
      errorCount: ingestionResult.errorCount,
      uploadType: isDelta ? 'delta' : 'full',
      errorsJson: ingestionResult.errors
    });

    const isFullySuccessful = ingestionResult.errorCount === 0;

    return res.status(isFullySuccessful ? 200 : 207).json({
      success: isFullySuccessful,
      message: isDelta
        ? `Delta update completed: ${ingestionResult.successCount} updated, ${ingestionResult.errorCount} failed`
        : `Bulk upload completed: ${ingestionResult.successCount} created, ${ingestionResult.errorCount} failed`,
      data: {
        logId: uploadLog.id,
        fileName: uploadLog.fileName,
        uploadType: uploadLog.uploadType,
        totalRows: ingestionResult.totalRows,
        successCount: ingestionResult.successCount,
        errorCount: ingestionResult.errorCount,
        errors: ingestionResult.errors,
        processedStudents: ingestionResult.processedStudents
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists history of past Excel uploads.
 */
const getUploadLogs = async (req, res, next) => {
  try {
    const logs = await ExcelUploadLog.findAll({
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Upload logs fetched successfully',
      data: logs
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Generates and streams downloadable .xlsx template.
 */
const downloadTemplate = async (req, res, next) => {
  try {
    const workbook = await generateStudentTemplateWorkbook();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="placetrack_student_template.xlsx"'
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  bulkUploadStudents,
  getUploadLogs,
  downloadTemplate
};

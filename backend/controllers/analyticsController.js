const {
  getTpoPlacementAnalytics,
  getCoordinatorPlacementAnalytics,
  generatePlacementReportData
} = require('../services/analyticsService');

/**
 * Step 75: College-wide placement analytics overview for TPO
 */
const getTpoAnalytics = async (req, res, next) => {
  try {
    const data = await getTpoPlacementAnalytics();
    return res.status(200).json({
      success: true,
      message: 'TPO analytics overview retrieved successfully',
      data
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 76: Department-specific analytics for Coordinator
 */
const getCoordinatorAnalytics = async (req, res, next) => {
  try {
    const departmentId = req.user.departmentId;
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'No assigned department found for this coordinator'
      });
    }

    const data = await getCoordinatorPlacementAnalytics(departmentId);
    return res.status(200).json({
      success: true,
      message: 'Department coordinator analytics retrieved successfully',
      data
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Specific department analytics by ID (TPO can inspect any dept, coordinator only own)
 */
const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const departmentId = parseInt(req.params.id, 10);

    if (req.user.role === 'coordinator' && req.user.departmentId !== departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view analytics for your assigned department'
      });
    }

    const data = await getCoordinatorPlacementAnalytics(departmentId);
    return res.status(200).json({
      success: true,
      message: 'Department analytics retrieved successfully',
      data
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 77 & 78: Placement audit report data / CSV download
 */
const downloadPlacementReport = async (req, res, next) => {
  try {
    const { departmentId, format = 'csv' } = req.query;

    let targetDeptId = null;
    if (req.user.role === 'coordinator') {
      targetDeptId = req.user.departmentId;
    } else if (departmentId) {
      targetDeptId = parseInt(departmentId, 10);
    }

    const rows = await generatePlacementReportData(targetDeptId);

    if (format === 'json') {
      return res.status(200).json({
        success: true,
        message: 'Report data generated successfully',
        data: rows
      });
    }

    // Generate CSV format
    const headers = [
      'PRN',
      'Student Name',
      'Email',
      'Phone',
      'Department',
      'Branch',
      'Division',
      'Admission Year',
      'Current Semester',
      'CGPA',
      'Active Backlogs',
      'Placement Status',
      'Placed Company',
      'Package (CTC)'
    ];

    const csvRows = [
      headers.join(','),
      ...rows.map((r) =>
        [
          `"${r.prn}"`,
          `"${r.name}"`,
          `"${r.email}"`,
          `"${r.phone}"`,
          `"${r.department}"`,
          `"${r.branch}"`,
          `"${r.division}"`,
          `"${r.admissionYear}"`,
          `"${r.currentSemester}"`,
          `"${r.cgpa}"`,
          `"${r.activeBacklogs}"`,
          `"${r.placementStatus}"`,
          `"${r.placedCompany}"`,
          `"${r.package}"`
        ].join(',')
      )
    ];

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="RCPIT_Placement_Report_${Date.now()}.csv"`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTpoAnalytics,
  getCoordinatorAnalytics,
  getDepartmentAnalytics,
  downloadPlacementReport
};

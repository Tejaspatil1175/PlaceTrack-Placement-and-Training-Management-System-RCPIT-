const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Step 75: GET /api/analytics/overview & /api/analytics/tpo (TPO only)
router.get(
  '/overview',
  authenticate,
  requireRole('tpo'),
  analyticsController.getTpoAnalytics
);

router.get(
  '/tpo',
  authenticate,
  requireRole('tpo'),
  analyticsController.getTpoAnalytics
);

// Step 76: GET /api/analytics/coordinator (Coordinator only)
router.get(
  '/coordinator',
  authenticate,
  requireRole('coordinator'),
  analyticsController.getCoordinatorAnalytics
);

// GET /api/analytics/department/:id (TPO & Coordinator)
router.get(
  '/department/:id',
  authenticate,
  requireRole('tpo', 'coordinator'),
  analyticsController.getDepartmentAnalytics
);

// Step 78: GET /api/analytics/report/download (TPO & Coordinator)
router.get(
  '/report/download',
  authenticate,
  requireRole('tpo', 'coordinator'),
  analyticsController.downloadPlacementReport
);

module.exports = router;

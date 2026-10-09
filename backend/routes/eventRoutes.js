const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Step 71: POST /api/events (TPO & Coordinator)
router.post(
  '/',
  authenticate,
  requireRole('tpo', 'coordinator'),
  eventController.createEvent
);

// Step 72: GET /api/events (Authenticated: TPO, Coordinator, Student)
router.get(
  '/',
  authenticate,
  eventController.listEvents
);

// GET /api/events/:id
router.get(
  '/:id',
  authenticate,
  eventController.getEventById
);

// PUT /api/events/:id (TPO & Coordinator)
router.put(
  '/:id',
  authenticate,
  requireRole('tpo', 'coordinator'),
  eventController.updateEvent
);

// DELETE /api/events/:id (TPO & Coordinator)
router.delete(
  '/:id',
  authenticate,
  requireRole('tpo', 'coordinator'),
  eventController.deleteEvent
);

module.exports = router;

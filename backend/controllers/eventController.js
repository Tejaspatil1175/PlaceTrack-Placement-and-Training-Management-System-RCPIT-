const { Op } = require('sequelize');
const { Event, User, Department } = require('../models');

/**
 * Step 71: Create a new training or industry program event (TPO & Coordinator)
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      type,
      date,
      time,
      location,
      description,
      audienceScope,
      departmentId
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Event title and date are required'
      });
    }

    let effectiveDeptId = departmentId || null;
    let effectiveScope = audienceScope || 'college_wide';

    if (req.user.role === 'coordinator') {
      effectiveDeptId = req.user.departmentId;
      effectiveScope = 'my_department';
    }

    const event = await Event.create({
      title,
      type: type || 'Workshop',
      date,
      time: time || '',
      location: location || '',
      description: description || '',
      audienceScope: effectiveScope,
      departmentId: effectiveDeptId,
      createdBy: req.user.id
    });

    const populatedEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Event scheduled successfully',
      data: populatedEvent
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Step 72: List events with role and department awareness
 */
const listEvents = async (req, res, next) => {
  try {
    const { type, search, departmentId } = req.query;
    const where = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    // Role-aware visibility filtering
    if (req.user.role === 'tpo') {
      if (departmentId) {
        where.departmentId = departmentId;
      }
    } else {
      // Coordinator or Student: can view college_wide events OR events scoped to their department
      const userDeptId = req.user.departmentId;
      where[Op.or] = [
        { audienceScope: 'college_wide' },
        { departmentId: null },
        ...(userDeptId ? [{ departmentId: userDeptId }] : [])
      ];
    }

    const events = await Event.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['date', 'ASC'], ['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Events fetched successfully',
      data: events
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event fetched successfully',
      data: event
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update event (TPO or creator coordinator)
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Permission check
    if (req.user.role !== 'tpo' && event.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit events you created'
      });
    }

    const {
      title,
      type,
      date,
      time,
      location,
      description,
      audienceScope,
      departmentId
    } = req.body;

    if (title !== undefined) event.title = title;
    if (type !== undefined) event.type = type;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (location !== undefined) event.location = location;
    if (description !== undefined) event.description = description;
    if (audienceScope !== undefined) event.audienceScope = audienceScope;
    if (departmentId !== undefined) event.departmentId = departmentId;

    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete event (TPO or creator coordinator)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Permission check
    if (req.user.role !== 'tpo' && event.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete events you created'
      });
    }

    await event.destroy();

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent
};

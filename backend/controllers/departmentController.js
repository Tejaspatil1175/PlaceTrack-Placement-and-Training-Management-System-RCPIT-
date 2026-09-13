const { Department, User } = require('../models');

/**
 * Creates a new academic department (TPO only).
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;

    const existing = await Department.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Department '${name}' already exists`
      });
    }

    const department = await Department.create({ name });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists all departments along with their assigned coordinators.
 */
const listDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: User,
          as: 'users',
          where: { role: 'coordinator' },
          required: false,
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Departments fetched successfully',
      data: departments
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDepartment,
  listDepartments
};

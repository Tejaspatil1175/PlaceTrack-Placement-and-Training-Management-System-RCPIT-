const { User, Department } = require('../models');
const { hashPassword } = require('../utils/password');

/**
 * Creates a department coordinator user (TPO only).
 */
const createCoordinator = async (req, res, next) => {
  try {
    const { name, email, phone, departmentId, password } = req.body;

    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `A user with email '${email}' already exists`
      });
    }

    const initialPassword = password || 'Coordinator@123';
    const passwordHash = await hashPassword(initialPassword);

    const coordinator = await User.create({
      name,
      email,
      phone: phone || null,
      role: 'coordinator',
      departmentId,
      passwordHash,
      mustResetPassword: true
    });

    return res.status(201).json({
      success: true,
      message: 'Coordinator created successfully',
      data: {
        id: coordinator.id,
        name: coordinator.name,
        email: coordinator.email,
        phone: coordinator.phone,
        role: coordinator.role,
        departmentId: coordinator.departmentId,
        mustResetPassword: coordinator.mustResetPassword,
        createdAt: coordinator.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists all coordinators with their associated department details.
 */
const listCoordinators = async (req, res, next) => {
  try {
    const coordinators = await User.findAll({
      where: { role: 'coordinator' },
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Coordinators fetched successfully',
      data: coordinators
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Updates a coordinator's profile details.
 */
const updateCoordinator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, departmentId } = req.body;

    const coordinator = await User.findOne({
      where: { id, role: 'coordinator' }
    });

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator not found'
      });
    }

    if (departmentId && departmentId !== coordinator.departmentId) {
      const deptExists = await Department.findByPk(departmentId);
      if (!deptExists) {
        return res.status(404).json({
          success: false,
          message: 'Target department not found'
        });
      }
      coordinator.departmentId = departmentId;
    }

    if (email && email !== coordinator.email) {
      const emailTaken = await User.findOne({ where: { email } });
      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: `Email '${email}' is already taken by another user`
        });
      }
      coordinator.email = email;
    }

    if (name) coordinator.name = name;
    if (phone !== undefined) coordinator.phone = phone;

    await coordinator.save();

    return res.status(200).json({
      success: true,
      message: 'Coordinator updated successfully',
      data: {
        id: coordinator.id,
        name: coordinator.name,
        email: coordinator.email,
        phone: coordinator.phone,
        departmentId: coordinator.departmentId
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Deletes a coordinator account.
 */
const deleteCoordinator = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coordinator = await User.findOne({
      where: { id, role: 'coordinator' }
    });

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator not found'
      });
    }

    await coordinator.destroy();

    return res.status(200).json({
      success: true,
      message: 'Coordinator removed successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCoordinator,
  listCoordinators,
  updateCoordinator,
  deleteCoordinator
};

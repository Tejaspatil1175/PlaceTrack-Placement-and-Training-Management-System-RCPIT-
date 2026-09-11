'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create departments table
    await queryInterface.createTable('departments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 2. Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      prn: {
        type: Sequelize.STRING(30),
        allowNull: true,
        unique: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female', 'Other'),
        allowNull: true
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      passwordHash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('tpo', 'coordinator', 'student'),
        allowNull: false,
        defaultValue: 'student'
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      mustResetPassword: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 3. Create student_profiles table
    await queryInterface.createTable('student_profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      branch: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      division: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      admissionYear: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currentSemester: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      cgpa: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      activeBacklogs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      resumeUrl: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      skills: {
        type: Sequelize.JSON,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 4. Create semester_records table
    await queryInterface.createTable('semester_records', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'student_profiles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      semesterNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sgpa: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false
      },
      credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      newBacklogs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      clearedBacklogs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Compound unique index for studentId + semesterNumber
    await queryInterface.addIndex('semester_records', ['studentId', 'semesterNumber'], {
      unique: true,
      name: 'unique_student_semester'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('semester_records');
    await queryInterface.dropTable('student_profiles');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('departments');
  }
};

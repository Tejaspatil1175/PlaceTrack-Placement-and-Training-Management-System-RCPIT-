const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class StudentProfile extends Model {}

StudentProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.STRING(50),
      allowNull: false
    },
    division: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    admissionYear: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currentSemester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 8
      }
    },
    cgpa: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.0,
        max: 10.0
      },
      comment: 'Cached credit-weighted cumulative grade point average'
    },
    activeBacklogs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'Cached active uncleared backlog count'
    },
    resumeUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'StudentProfile',
    tableName: 'student_profiles',
    timestamps: true
  }
);

module.exports = StudentProfile;

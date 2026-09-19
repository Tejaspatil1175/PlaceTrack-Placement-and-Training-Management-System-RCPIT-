const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Drive extends Model {}

Drive.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    companyName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ctc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Cost to Company in LPA'
    },
    minCgpa: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.0,
        max: 10.0
      }
    },
    maxActiveBacklogs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    allowedBranches: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    minSemester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 8
      }
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'UPCOMING'
    }
  },
  {
    sequelize,
    modelName: 'Drive',
    tableName: 'drives',
    timestamps: true
  }
);

module.exports = Drive;

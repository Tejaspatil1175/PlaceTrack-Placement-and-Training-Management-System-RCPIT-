const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Application extends Model {}

Application.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'student_profiles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    driveId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'drives',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('APPLIED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'),
      allowNull: false,
      defaultValue: 'APPLIED'
    },
    appliedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Application',
    tableName: 'applications',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'driveId'],
        name: 'unique_student_drive_application'
      }
    ]
  }
);

module.exports = Application;

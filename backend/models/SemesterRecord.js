const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class SemesterRecord extends Model {}

SemesterRecord.init(
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
    semesterNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 8
      }
    },
    sgpa: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      validate: {
        min: 0.0,
        max: 10.0
      }
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    newBacklogs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    clearedBacklogs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  },
  {
    sequelize,
    modelName: 'SemesterRecord',
    tableName: 'semester_records',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'semesterNumber'],
        name: 'unique_student_semester'
      }
    ]
  }
);

module.exports = SemesterRecord;

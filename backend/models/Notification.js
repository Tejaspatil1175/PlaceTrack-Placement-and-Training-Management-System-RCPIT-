const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    targetType: {
      type: DataTypes.ENUM('ALL', 'DEPARTMENT', 'STUDENTS', 'COORDINATORS'),
      allowNull: false,
      defaultValue: 'ALL'
    },
    targetDepartmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    sentBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    type: {
      type: DataTypes.ENUM('INFO', 'DRIVE', 'SELECTION', 'GENERAL'),
      allowNull: false,
      defaultValue: 'GENERAL'
    }
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true
  }
);

module.exports = Notification;

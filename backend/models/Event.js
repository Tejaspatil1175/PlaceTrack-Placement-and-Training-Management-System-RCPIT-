const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Event extends Model {}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Workshop'
    },
    date: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    time: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    audienceScope: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'college_wide'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
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
    }
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    timestamps: true
  }
);

module.exports = Event;

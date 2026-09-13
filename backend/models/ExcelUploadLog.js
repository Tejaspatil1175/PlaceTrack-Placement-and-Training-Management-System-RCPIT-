const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ExcelUploadLog extends Model {}

ExcelUploadLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    totalRows: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    successCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    errorCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    uploadType: {
      type: DataTypes.ENUM('full', 'delta'),
      allowNull: false,
      defaultValue: 'full'
    },
    errorsJson: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'ExcelUploadLog',
    tableName: 'excel_upload_logs',
    timestamps: true
  }
);

module.exports = ExcelUploadLog;

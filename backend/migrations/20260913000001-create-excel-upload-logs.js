'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('excel_upload_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      totalRows: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      successCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      errorCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      uploadType: {
        type: Sequelize.ENUM('full', 'delta'),
        allowNull: false,
        defaultValue: 'full'
      },
      errorsJson: {
        type: Sequelize.JSON,
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

    await queryInterface.addIndex('excel_upload_logs', ['uploadedBy']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('excel_upload_logs');
  }
};

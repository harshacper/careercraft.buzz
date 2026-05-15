const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LoginDetail = sequelize.define('LoginDetail', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING, // 'Success' or 'Failed'
    allowNull: false,
  },
  userAgent: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = LoginDetail;

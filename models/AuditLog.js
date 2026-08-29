const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userType: {
      type: DataTypes.ENUM('admin', 'karyawan', 'nasabah'),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    resourceType: {
      type: DataTypes.STRING
    },
    resourceId: {
      type: DataTypes.UUID
    },
    status: {
      type: DataTypes.ENUM('success', 'failed'),
      defaultValue: 'success'
    },
    ipAddress: {
      type: DataTypes.STRING
    },
    userAgent: {
      type: DataTypes.TEXT
    },
    changes: {
      type: DataTypes.JSON
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return AuditLog;
};

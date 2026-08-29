const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemUpdate = sequelize.define('SystemUpdate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    changeLog: {
      type: DataTypes.JSON
    },
    type: {
      type: DataTypes.ENUM('bug_fix', 'feature', 'security', 'performance', 'maintenance'),
      defaultValue: 'maintenance'
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'low'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    autoUpdate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rolloutPercentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    releaseNotes: {
      type: DataTypes.TEXT
    },
    rollbackScript: {
      type: DataTypes.TEXT
    },
    completedAt: {
      type: DataTypes.DATE
    },
    failedReason: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return SystemUpdate;
};

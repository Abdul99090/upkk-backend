const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin'),
      defaultValue: 'admin'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE
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

  // Hash password before save
  Admin.beforeCreate(async (admin) => {
    if (admin.password) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }
  });

  Admin.beforeUpdate(async (admin) => {
    if (admin.changed('password')) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }
  });

  // Method to compare password
  Admin.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return Admin;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LokasiAbsen = sequelize.define('LokasiAbsen', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    radius: {
      type: DataTypes.INTEGER,
      defaultValue: 100 // dalam meter
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING
    },
    province: {
      type: DataTypes.STRING
    },
    checkInTime: {
      type: DataTypes.TIME
    },
    checkOutTime: {
      type: DataTypes.TIME
    },
    workingDays: {
      type: DataTypes.JSON,
      defaultValue: [1, 2, 3, 4, 5] // 1-7 untuk Senin-Minggu
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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

  LokasiAbsen.associate = function(models) {
    LokasiAbsen.hasMany(models.Absensi, { foreignKey: 'lokasiAbsenId' });
  };

  return LokasiAbsen;
};

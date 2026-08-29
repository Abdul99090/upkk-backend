const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Absensi = sequelize.define('Absensi', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    karyawanId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    lokasiAbsenId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    checkOutTime: {
      type: DataTypes.DATE
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    checkInPhoto: {
      type: DataTypes.STRING
    },
    checkOutPhoto: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('on_time', 'late', 'absent'),
      defaultValue: 'on_time'
    },
    notes: {
      type: DataTypes.TEXT
    },
    distance: {
      type: DataTypes.DECIMAL(10, 2)
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

  Absensi.associate = function(models) {
    Absensi.belongsTo(models.Karyawan, { foreignKey: 'karyawanId' });
    Absensi.belongsTo(models.LokasiAbsen, { foreignKey: 'lokasiAbsenId' });
  };

  return Absensi;
};

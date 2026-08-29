const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaksi = sequelize.define('Transaksi', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    karyawanId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    nasabahId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('pembayaran', 'pemasukan', 'pencairan', 'bonus', 'denda'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    qrisCode: {
      type: DataTypes.TEXT
    },
    qrisReference: {
      type: DataTypes.STRING,
      unique: true
    },
    proofPhoto: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    processedBy: {
      type: DataTypes.UUID
    },
    processedAt: {
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

  Transaksi.associate = function(models) {
    Transaksi.belongsTo(models.Karyawan, { foreignKey: 'karyawanId' });
    Transaksi.belongsTo(models.Nasabah, { foreignKey: 'nasabahId' });
  };

  return Transaksi;
};

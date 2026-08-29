const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Angsuran = sequelize.define('Angsuran', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pinjamanId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    nasabahId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    karyawanId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paidDate: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'late', 'cancelled'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'transfer', 'qris'),
      defaultValue: 'cash'
    },
    notes: {
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

  Angsuran.associate = function(models) {
    Angsuran.belongsTo(models.Pinjaman, { foreignKey: 'pinjamanId' });
    Angsuran.belongsTo(models.Nasabah, { foreignKey: 'nasabahId' });
    Angsuran.belongsTo(models.Karyawan, { foreignKey: 'karyawanId' });
  };

  return Angsuran;
};

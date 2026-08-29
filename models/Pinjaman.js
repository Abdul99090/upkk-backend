const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pinjaman = sequelize.define('Pinjaman', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nasabahId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    karyawanId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    deductionAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    disbursedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    loanType: {
      type: DataTypes.ENUM('daily', 'weekly'),
      defaultValue: 'daily'
    },
    isNewCustomer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    totalInstallments: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    installmentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'disbursed', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE
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

  Pinjaman.associate = function(models) {
    Pinjaman.belongsTo(models.Nasabah, { foreignKey: 'nasabahId' });
    Pinjaman.belongsTo(models.Karyawan, { foreignKey: 'karyawanId' });
    Pinjaman.hasMany(models.Angsuran, { foreignKey: 'pinjamanId' });
  };

  return Pinjaman;
};

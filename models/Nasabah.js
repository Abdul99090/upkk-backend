const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Nasabah = sequelize.define('Nasabah', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    karyawanId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nik: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING
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
    ktpPhoto: {
      type: DataTypes.STRING
    },
    profilePhoto: {
      type: DataTypes.STRING
    },
    bankName: {
      type: DataTypes.STRING
    },
    bankAccount: {
      type: DataTypes.STRING
    },
    noRekening: {
      type: DataTypes.STRING
    },
    qrisCode: {
      type: DataTypes.TEXT
    },
    occupancy: {
      type: DataTypes.STRING
    },
    maritalStatus: {
      type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed')
    },
    monthlyIncome: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    loanType: {
      type: DataTypes.ENUM('daily', 'weekly'),
      defaultValue: 'daily'
    },
    isNewCustomer: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
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

  Nasabah.associate = function(models) {
    Nasabah.belongsTo(models.Karyawan, { foreignKey: 'karyawanId' });
    Nasabah.hasMany(models.Transaksi, { foreignKey: 'nasabahId' });
  };

  return Nasabah;
};

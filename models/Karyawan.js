const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Karyawan = sequelize.define('Karyawan', {
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
      type: DataTypes.STRING,
      allowNull: false
    },
    nik: {
      type: DataTypes.STRING,
      unique: true
    },
    address: {
      type: DataTypes.TEXT
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salary: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    bankAccount: {
      type: DataTypes.STRING
    },
    bankName: {
      type: DataTypes.STRING
    },
    profilePhoto: {
      type: DataTypes.STRING
    },
    ktpPhoto: {
      type: DataTypes.STRING
    },
    noRekening: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
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
  Karyawan.beforeCreate(async (karyawan) => {
    if (karyawan.password) {
      karyawan.password = await bcrypt.hash(karyawan.password, 10);
    }
  });

  Karyawan.beforeUpdate(async (karyawan) => {
    if (karyawan.changed('password')) {
      karyawan.password = await bcrypt.hash(karyawan.password, 10);
    }
  });

  Karyawan.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  Karyawan.associate = function(models) {
    Karyawan.hasMany(models.Absensi, { foreignKey: 'karyawanId' });
    Karyawan.hasMany(models.Transaksi, { foreignKey: 'karyawanId' });
  };

  return Karyawan;
};

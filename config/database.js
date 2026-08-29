require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'upkk_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const Admin = require('../models/Admin');
const Karyawan = require('../models/Karyawan');
const Nasabah = require('../models/Nasabah');
const Transaksi = require('../models/Transaksi');
const Absensi = require('../models/Absensi');
const LokasiAbsen = require('../models/LokasiAbsen');
const PaymentQRIS = require('../models/PaymentQRIS');
const Pinjaman = require('../models/Pinjaman');
const Angsuran = require('../models/Angsuran');
const AuditLog = require('../models/AuditLog');
const SystemUpdate = require('../models/SystemUpdate');

// Initialize models
const models = {
  Admin: Admin(sequelize),
  Karyawan: Karyawan(sequelize),
  Nasabah: Nasabah(sequelize),
  Transaksi: Transaksi(sequelize),
  Absensi: Absensi(sequelize),
  LokasiAbsen: LokasiAbsen(sequelize),
  PaymentQRIS: PaymentQRIS(sequelize),
  Pinjaman: Pinjaman(sequelize),
  Angsuran: Angsuran(sequelize),
  AuditLog: AuditLog(sequelize),
  SystemUpdate: SystemUpdate(sequelize)
};

// Setup associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Create tables
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('All models were synchronized successfully.');
    
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  models,
  initializeDatabase
};

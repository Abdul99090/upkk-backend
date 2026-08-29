const express = require('express');
const { models } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const qrisService = require('../services/qrisService');
const { AuditLog } = require('../middleware/errorHandler');

const router = express.Router();

// Get Dashboard Statistics
router.get('/dashboard', authenticateAdmin, async (req, res, next) => {
  try {
    const totalKaryawan = await models.Karyawan.count();
    const totalNasabah = await models.Nasabah.count();
    
    // Revenue this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    const totalRevenue = await models.Transaksi.sum('amount', {
      where: {
        type: ['pembayaran', 'pemasukan'],
        status: 'completed',
        createdAt: {
          [models.sequelize.Op.gte]: currentMonth
        }
      }
    });

    const totalWithdrawals = await models.Transaksi.sum('amount', {
      where: {
        type: 'pencairan',
        status: 'completed',
        createdAt: {
          [models.sequelize.Op.gte]: currentMonth
        }
      }
    });

    const pendingPayments = await models.PaymentQRIS.count({
      where: { status: 'pending' }
    });

    res.json({
      totalKaryawan,
      totalNasabah,
      totalRevenue: totalRevenue || 0,
      totalWithdrawals: totalWithdrawals || 0,
      pendingPayments
    });
  } catch (error) {
    next(error);
  }
});

// Karyawan Management
// Get all karyawan
router.get('/karyawan', authenticateAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[models.sequelize.Op.or] = [
        { name: { [models.sequelize.Op.iLike]: `%${search}%` } },
        { email: { [models.sequelize.Op.iLike]: `%${search}%` } },
        { nik: { [models.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;

    const karyawans = await models.Karyawan.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: karyawans.rows,
      pagination: {
        total: karyawans.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(karyawans.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create karyawan
router.post('/karyawan', authenticateAdmin, upload.single('profilePhoto'), async (req, res, next) => {
  try {
    const { name, email, password, phone, nik, position, salary, bankName, bankAccount } = req.body;

    const karyawan = await models.Karyawan.create({
      name,
      email,
      password,
      phone,
      nik,
      position,
      salary: salary || 0,
      bankName,
      bankAccount,
      profilePhoto: req.file ? req.file.filename : null,
      status: 'active'
    });

    // Log audit
    await models.AuditLog.create({
      userId: req.user.id,
      userType: 'admin',
      action: 'CREATE_KARYAWAN',
      resourceType: 'Karyawan',
      resourceId: karyawan.id,
      description: `Created karyawan: ${name}`
    });

    res.status(201).json({
      message: 'Karyawan created successfully',
      data: karyawan
    });
  } catch (error) {
    next(error);
  }
});

// Update karyawan
router.put('/karyawan/:id', authenticateAdmin, upload.single('profilePhoto'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, nik, position, salary, status, bankName, bankAccount } = req.body;

    const karyawan = await models.Karyawan.findByPk(id);
    if (!karyawan) {
      return res.status(404).json({ message: 'Karyawan not found' });
    }

    const updateData = {
      name: name || karyawan.name,
      email: email || karyawan.email,
      phone: phone || karyawan.phone,
      nik: nik || karyawan.nik,
      position: position || karyawan.position,
      salary: salary || karyawan.salary,
      status: status || karyawan.status,
      bankName: bankName || karyawan.bankName,
      bankAccount: bankAccount || karyawan.bankAccount
    };

    if (req.file) {
      updateData.profilePhoto = req.file.filename;
    }

    await karyawan.update(updateData);

    // Log audit
    await models.AuditLog.create({
      userId: req.user.id,
      userType: 'admin',
      action: 'UPDATE_KARYAWAN',
      resourceType: 'Karyawan',
      resourceId: id,
      description: `Updated karyawan: ${name}`
    });

    res.json({
      message: 'Karyawan updated successfully',
      data: karyawan
    });
  } catch (error) {
    next(error);
  }
});

// Delete karyawan
router.delete('/karyawan/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const karyawan = await models.Karyawan.findByPk(id);
    if (!karyawan) {
      return res.status(404).json({ message: 'Karyawan not found' });
    }

    await karyawan.destroy();

    // Log audit
    await models.AuditLog.create({
      userId: req.user.id,
      userType: 'admin',
      action: 'DELETE_KARYAWAN',
      resourceType: 'Karyawan',
      resourceId: id,
      description: `Deleted karyawan: ${karyawan.name}`
    });

    res.json({ message: 'Karyawan deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Lokasi Absen Management
// Create lokasi absen
router.post('/lokasi-absen', authenticateAdmin, async (req, res, next) => {
  try {
    const { name, latitude, longitude, radius, address, city, province, checkInTime, checkOutTime, workingDays } = req.body;

    const lokasi = await models.LokasiAbsen.create({
      name,
      latitude,
      longitude,
      radius: radius || 100,
      address,
      city,
      province,
      checkInTime,
      checkOutTime,
      workingDays: workingDays || [1, 2, 3, 4, 5]
    });

    res.status(201).json({
      message: 'Lokasi absen created successfully',
      data: lokasi
    });
  } catch (error) {
    next(error);
  }
});

// Get all lokasi absen
router.get('/lokasi-absen', authenticateAdmin, async (req, res, next) => {
  try {
    const lokasis = await models.LokasiAbsen.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ data: lokasis });
  } catch (error) {
    next(error);
  }
});

// Update lokasi absen
router.put('/lokasi-absen/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, radius, address, city, province, checkInTime, checkOutTime, workingDays, isActive } = req.body;

    const lokasi = await models.LokasiAbsen.findByPk(id);
    if (!lokasi) {
      return res.status(404).json({ message: 'Lokasi absen not found' });
    }

    await lokasi.update({
      name: name || lokasi.name,
      latitude: latitude || lokasi.latitude,
      longitude: longitude || lokasi.longitude,
      radius: radius !== undefined ? radius : lokasi.radius,
      address: address || lokasi.address,
      city: city || lokasi.city,
      province: province || lokasi.province,
      checkInTime: checkInTime || lokasi.checkInTime,
      checkOutTime: checkOutTime || lokasi.checkOutTime,
      workingDays: workingDays || lokasi.workingDays,
      isActive: isActive !== undefined ? isActive : lokasi.isActive
    });

    res.json({
      message: 'Lokasi absen updated successfully',
      data: lokasi
    });
  } catch (error) {
    next(error);
  }
});

// Revenue Report
router.get('/report/revenue', authenticateAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate, karyawanId } = req.query;

    const where = {
      type: ['pembayaran', 'pemasukan'],
      status: 'completed'
    };

    if (startDate && endDate) {
      where.createdAt = {
        [models.sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (karyawanId) {
      where.karyawanId = karyawanId;
    }

    const revenue = await models.Transaksi.findAll({
      where,
      include: [
        { model: models.Karyawan, attributes: ['id', 'name', 'position'] },
        { model: models.Nasabah, attributes: ['id', 'name', 'nik'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const total = revenue.reduce((sum, trans) => sum + parseFloat(trans.amount), 0);

    res.json({
      data: revenue,
      total,
      count: revenue.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

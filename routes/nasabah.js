const express = require('express');
const { models } = require('../config/database');
const { authenticateToken, authenticateKaryawan } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { calculateLoanPlan, normalizeLoanAmount } = require('../services/loanRules');

const router = express.Router();

// Create nasabah (by karyawan)
router.post('/create', authenticateKaryawan, upload.fields([
  { name: 'ktpPhoto', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const {
      name, nik, phone, email, address, city, province,
      bankName, bankAccount, noRekening, qrisCode,
      occupancy, maritalStatus, monthlyIncome, notes,
      loanType = 'daily', isNewCustomer = true
    } = req.body;

    const karyawanId = req.user.id;

    // Validate required fields
    if (!name || !nik || !phone) {
      return res.status(400).json({
        message: 'Name, NIK, and phone are required'
      });
    }

    // Check if NIK already exists
    const existingNasabah = await models.Nasabah.findOne({
      where: { nik }
    });

    if (existingNasabah) {
      return res.status(400).json({ message: 'NIK already registered' });
    }

    const normalizedMonthlyIncome = Number(monthlyIncome || 0);
    const normalizedLoanType = ['daily', 'weekly'].includes(loanType) ? loanType : 'daily';
    const normalizedNewCustomer = Boolean(isNewCustomer === true || isNewCustomer === 'true');

    const nasabah = await models.Nasabah.create({
      karyawanId,
      name,
      nik,
      phone,
      email: email || null,
      address,
      city,
      province,
      ktpPhoto: req.files.ktpPhoto ? req.files.ktpPhoto[0].filename : null,
      profilePhoto: req.files.profilePhoto ? req.files.profilePhoto[0].filename : null,
      bankName,
      bankAccount,
      noRekening,
      qrisCode: qrisCode || null,
      occupancy,
      maritalStatus,
      monthlyIncome: normalizedMonthlyIncome,
      loanType: normalizedLoanType,
      isNewCustomer: normalizedNewCustomer,
      notes,
      status: 'active'
    });

    // Log audit
    await models.AuditLog.create({
      userId: karyawanId,
      userType: 'karyawan',
      action: 'CREATE_NASABAH',
      resourceType: 'Nasabah',
      resourceId: nasabah.id,
      description: `Created nasabah: ${name}`
    });

    const loanPlan = calculateLoanPlan({
      amount: normalizeLoanAmount(200000),
      type: normalizedLoanType,
      isNewCustomer: normalizedNewCustomer
    });

    res.status(201).json({
      message: 'Nasabah created successfully',
      data: {
        ...nasabah.toJSON(),
        loanPlan
      }
    });
  } catch (error) {
    next(error);
  }
});

// Loan calculation helper
router.post('/loan-plan', authenticateToken, async (req, res, next) => {
  try {
    const { amount, type = 'daily', isNewCustomer = false } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const plan = calculateLoanPlan({
      amount,
      type,
      isNewCustomer: isNewCustomer === true || isNewCustomer === 'true'
    });

    res.json({ data: plan });
  } catch (error) {
    next(error);
  }
});

// Get nasabah by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const nasabah = await models.Nasabah.findByPk(id, {
      include: [
        {
          model: models.Karyawan,
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!nasabah) {
      return res.status(404).json({ message: 'Nasabah not found' });
    }

    // Check authorization - only karyawan owner, admin, or nasabah can view
    if (req.user.type === 'karyawan' && nasabah.karyawanId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ data: nasabah });
  } catch (error) {
    next(error);
  }
});

// Update nasabah (by karyawan)
router.put('/:id', authenticateKaryawan, upload.fields([
  { name: 'ktpPhoto', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, phone, email, address, city, province,
      bankName, bankAccount, noRekening, qrisCode,
      occupancy, maritalStatus, monthlyIncome, notes, status
    } = req.body;

    const nasabah = await models.Nasabah.findByPk(id);

    if (!nasabah) {
      return res.status(404).json({ message: 'Nasabah not found' });
    }

    // Check authorization
    if (nasabah.karyawanId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {
      name: name || nasabah.name,
      phone: phone || nasabah.phone,
      email: email || nasabah.email,
      address: address || nasabah.address,
      city: city || nasabah.city,
      province: province || nasabah.province,
      bankName: bankName || nasabah.bankName,
      bankAccount: bankAccount || nasabah.bankAccount,
      noRekening: noRekening || nasabah.noRekening,
      qrisCode: qrisCode || nasabah.qrisCode,
      occupancy: occupancy || nasabah.occupancy,
      maritalStatus: maritalStatus || nasabah.maritalStatus,
      monthlyIncome: monthlyIncome || nasabah.monthlyIncome,
      notes: notes || nasabah.notes
    };

    if (status) updateData.status = status;

    if (req.files.ktpPhoto) {
      updateData.ktpPhoto = req.files.ktpPhoto[0].filename;
    }

    if (req.files.profilePhoto) {
      updateData.profilePhoto = req.files.profilePhoto[0].filename;
    }

    await nasabah.update(updateData);

    // Log audit
    await models.AuditLog.create({
      userId: req.user.id,
      userType: 'karyawan',
      action: 'UPDATE_NASABAH',
      resourceType: 'Nasabah',
      resourceId: id,
      description: `Updated nasabah: ${name}`
    });

    res.json({
      message: 'Nasabah updated successfully',
      data: nasabah
    });
  } catch (error) {
    next(error);
  }
});

// Get nasabah statistics (for admin)
router.get('/stats/summary', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const total = await models.Nasabah.count();
    const active = await models.Nasabah.count({ where: { status: 'active' } });
    const inactive = await models.Nasabah.count({ where: { status: 'inactive' } });
    const suspended = await models.Nasabah.count({ where: { status: 'suspended' } });

    // Top performing karyawan
    const topKaryawan = await models.Nasabah.findAll({
      attributes: [
        'karyawanId',
        [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'totalNasabah'],
        [models.sequelize.fn('SUM', models.sequelize.col('monthlyIncome')), 'totalIncome']
      ],
      group: ['karyawanId'],
      raw: true,
      order: [[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      total,
      active,
      inactive,
      suspended,
      topKaryawan
    });
  } catch (error) {
    next(error);
  }
});

// Search nasabah (by NIK, name, or phone)
router.get('/search/query', authenticateToken, async (req, res, next) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const where = {
      [models.sequelize.Op.or]: [
        { nik: { [models.sequelize.Op.iLike]: `%${q}%` } },
        { name: { [models.sequelize.Op.iLike]: `%${q}%` } },
        { phone: { [models.sequelize.Op.iLike]: `%${q}%` } }
      ]
    };

    if (req.user.type === 'karyawan') {
      where.karyawanId = req.user.id;
    }

    const nasabahs = await models.Nasabah.findAll({
      where,
      limit: 20,
      attributes: ['id', 'name', 'nik', 'phone', 'status', 'monthlyIncome']
    });

    res.json({ data: nasabahs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

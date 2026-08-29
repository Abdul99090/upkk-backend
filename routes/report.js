const express = require('express');
const { models } = require('../config/database');
const { authenticateAdmin, authenticateKaryawan } = require('../middleware/auth');

const router = express.Router();

// Revenue Report (Admin)
router.get('/revenue', authenticateAdmin, async (req, res, next) => {
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

// Withdrawal Report (Admin)
router.get('/withdrawals', authenticateAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate, status = 'all' } = req.query;

    const where = { type: 'pencairan' };

    if (startDate && endDate) {
      where.createdAt = {
        [models.sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (status !== 'all') {
      where.status = status;
    }

    const withdrawals = await models.Transaksi.findAll({
      where,
      include: [
        { model: models.Karyawan, attributes: ['id', 'name', 'position', 'bankAccount'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const total = withdrawals.reduce((sum, trans) => sum + parseFloat(trans.amount), 0);

    res.json({
      data: withdrawals,
      total,
      count: withdrawals.length
    });
  } catch (error) {
    next(error);
  }
});

// Daily Report (Absensi)
router.get('/absensi-daily', authenticateAdmin, async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const absensi = await models.Absensi.findAll({
      where: {
        createdAt: {
          [models.sequelize.Op.between]: [targetDate, nextDate]
        }
      },
      include: [
        { model: models.Karyawan, attributes: ['id', 'name', 'position'] },
        { model: models.LokasiAbsen, attributes: ['id', 'name', 'address'] }
      ],
      order: [['checkInTime', 'ASC']]
    });

    const onTime = absensi.filter(a => a.status === 'on_time').length;
    const late = absensi.filter(a => a.status === 'late').length;
    const absent = absensi.filter(a => a.status === 'absent').length;

    res.json({
      date: targetDate.toISOString().split('T')[0],
      data: absensi,
      summary: {
        total: absensi.length,
        onTime,
        late,
        absent
      }
    });
  } catch (error) {
    next(error);
  }
});

// Karyawan Performance Report
router.get('/karyawan-performance', authenticateAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [models.sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get all karyawan with their stats
    const karyawans = await models.Karyawan.findAll({
      attributes: ['id', 'name', 'position', 'email']
    });

    const performance = [];

    for (const karyawan of karyawans) {
      // Count nasabah
      const nasabahCount = await models.Nasabah.count({
        where: { karyawanId: karyawan.id }
      });

      // Calculate total revenue
      const totalRevenue = await models.Transaksi.sum('amount', {
        where: {
          karyawanId: karyawan.id,
          type: ['pembayaran', 'pemasukan'],
          status: 'completed',
          ...where
        }
      });

      // Count attendance
      const totalAttendance = await models.Absensi.count({
        where: {
          karyawanId: karyawan.id,
          ...where
        }
      });

      // Count on-time attendance
      const onTimeAttendance = await models.Absensi.count({
        where: {
          karyawanId: karyawan.id,
          status: 'on_time',
          ...where
        }
      });

      performance.push({
        karyawanId: karyawan.id,
        name: karyawan.name,
        position: karyawan.position,
        email: karyawan.email,
        nasabahCount,
        totalRevenue: totalRevenue || 0,
        totalAttendance,
        onTimeAttendance,
        attendanceRate: totalAttendance > 0 ? ((onTimeAttendance / totalAttendance) * 100).toFixed(2) + '%' : 'N/A'
      });
    }

    // Sort by revenue
    performance.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      data: performance
    });
  } catch (error) {
    next(error);
  }
});

// Top Nasabah Report (by income)
router.get('/top-nasabah', authenticateAdmin, async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const topNasabah = await models.Nasabah.findAll({
      attributes: [
        'id', 'name', 'nik', 'phone', 'monthlyIncome',
        [models.sequelize.literal('(SELECT COUNT(*) FROM "Transaksis" WHERE "Transaksis"."nasabahId" = "Nasabah"."id" AND "Transaksis"."type" = \'pembayaran\')'), 'totalPayments']
      ],
      where: { status: 'active' },
      order: [['monthlyIncome', 'DESC']],
      limit: parseInt(limit),
      subQuery: false,
      raw: true
    });

    res.json({
      data: topNasabah
    });
  } catch (error) {
    next(error);
  }
});

// Monthly Summary Report
router.get('/monthly-summary', authenticateAdmin, async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const revenue = await models.Transaksi.sum('amount', {
        where: {
          type: ['pembayaran', 'pemasukan'],
          status: 'completed',
          createdAt: {
            [models.sequelize.Op.between]: [startDate, endDate]
          }
        }
      });

      const withdrawals = await models.Transaksi.sum('amount', {
        where: {
          type: 'pencairan',
          status: 'completed',
          createdAt: {
            [models.sequelize.Op.between]: [startDate, endDate]
          }
        }
      });

      const transactionCount = await models.Transaksi.count({
        where: {
          status: 'completed',
          createdAt: {
            [models.sequelize.Op.between]: [startDate, endDate]
          }
        }
      });

      monthlyData.push({
        month: new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' }),
        revenue: revenue || 0,
        withdrawals: withdrawals || 0,
        net: (revenue || 0) - (withdrawals || 0),
        transactionCount
      });
    }

    res.json({
      year,
      data: monthlyData
    });
  } catch (error) {
    next(error);
  }
});

// Payment Status Report
router.get('/payment-status', authenticateAdmin, async (req, res, next) => {
  try {
    const pendingPayments = await models.PaymentQRIS.count({
      where: { status: 'pending' }
    });

    const confirmedPayments = await models.PaymentQRIS.count({
      where: { status: 'confirmed' }
    });

    const failedPayments = await models.PaymentQRIS.count({
      where: { status: 'failed' }
    });

    const totalAmount = await models.PaymentQRIS.sum('amount', {
      where: { status: 'confirmed' }
    });

    res.json({
      pendingPayments,
      confirmedPayments,
      failedPayments,
      totalAmount: totalAmount || 0
    });
  } catch (error) {
    next(error);
  }
});

// Karyawan Personal Report
router.get('/karyawan/personal-report', authenticateKaryawan, async (req, res, next) => {
  try {
    const karyawanId = req.user.id;

    // Total earnings
    const totalEarnings = await models.Transaksi.sum('amount', {
      where: {
        karyawanId,
        type: ['pembayaran', 'pemasukan'],
        status: 'completed'
      }
    });

    // Total withdrawals
    const totalWithdrawals = await models.Transaksi.sum('amount', {
      where: {
        karyawanId,
        type: 'pencairan',
        status: 'completed'
      }
    });

    // Nasabah count
    const nasabahCount = await models.Nasabah.count({
      where: { karyawanId }
    });

    // Attendance rate this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const attendanceThisMonth = await models.Absensi.count({
      where: {
        karyawanId,
        createdAt: {
          [models.sequelize.Op.between]: [currentMonth, nextMonth]
        }
      }
    });

    const onTimeThisMonth = await models.Absensi.count({
      where: {
        karyawanId,
        status: 'on_time',
        createdAt: {
          [models.sequelize.Op.between]: [currentMonth, nextMonth]
        }
      }
    });

    res.json({
      earnings: {
        total: totalEarnings || 0,
        withdrawn: totalWithdrawals || 0,
        available: (totalEarnings || 0) - (totalWithdrawals || 0)
      },
      nasabahCount,
      attendanceThisMonth: {
        total: attendanceThisMonth,
        onTime: onTimeThisMonth,
        rate: attendanceThisMonth > 0 ? ((onTimeThisMonth / attendanceThisMonth) * 100).toFixed(2) + '%' : 'N/A'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

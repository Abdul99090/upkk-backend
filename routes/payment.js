const express = require('express');
const { models } = require('../config/database');
const { authenticateToken, authenticateKaryawan, authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const qrisService = require('../services/qrisService');

const router = express.Router();

// Get payment QRIS (nasabah payment)
router.post('/qris/generate', authenticateKaryawan, async (req, res, next) => {
  try {
    const { nasabahId, amount, description } = req.body;

    if (!nasabahId || !amount) {
      return res.status(400).json({ message: 'Nasabah ID and amount are required' });
    }

    const nasabah = await models.Nasabah.findByPk(nasabahId);
    if (!nasabah) {
      return res.status(404).json({ message: 'Nasabah not found' });
    }

    // Check authorization
    if (nasabah.karyawanId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!nasabah.qrisCode) {
      return res.status(400).json({ message: 'Nasabah does not have QRIS code' });
    }

    // Generate payment QRIS
    const payment = await qrisService.generatePaymentQRIS(nasabah, amount, description || 'Payment');

    // Create transaction
    const transaction = await models.Transaksi.create({
      karyawanId: req.user.id,
      nasabahId: nasabahId,
      type: 'pembayaran',
      amount: amount,
      description: description || 'Payment',
      status: 'pending',
      qrisCode: nasabah.qrisCode
    });

    // Create payment QRIS record
    const paymentQRIS = await models.PaymentQRIS.create({
      transactionId: transaction.id,
      qrisCode: nasabah.qrisCode,
      amount: amount,
      status: 'pending',
      referenceNumber: `PAY${Date.now()}`,
      expiresAt: payment.expiresAt
    });

    res.json({
      message: 'Payment QRIS generated successfully',
      data: {
        transactionId: transaction.id,
        paymentId: paymentQRIS.id,
        qrImage: payment.qrImage,
        amount: payment.amount,
        expiresAt: payment.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Confirm payment (after nasabah pays)
router.post('/qris/confirm', authenticateKaryawan, upload.single('proofPhoto'), async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    const payment = await models.PaymentQRIS.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const transaction = await models.Transaksi.findByPk(payment.transactionId);
    if (transaction.karyawanId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Confirm payment
    const confirmed = await qrisService.confirmPayment(paymentId, req.file ? req.file.filename : null);

    // Log audit
    await models.AuditLog.create({
      userId: req.user.id,
      userType: 'karyawan',
      action: 'CONFIRM_PAYMENT',
      resourceType: 'PaymentQRIS',
      resourceId: paymentId,
      description: `Confirmed payment: ${transaction.amount}`
    });

    res.json({
      message: 'Payment confirmed successfully',
      data: confirmed
    });
  } catch (error) {
    next(error);
  }
});

// Get payment history (nasabah)
router.get('/history/nasabah/:nasabahId', authenticateToken, async (req, res, next) => {
  try {
    const { nasabahId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const nasabah = await models.Nasabah.findByPk(nasabahId);
    if (!nasabah) {
      return res.status(404).json({ message: 'Nasabah not found' });
    }

    // Check authorization
    if (req.user.type === 'karyawan' && nasabah.karyawanId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const offset = (page - 1) * limit;

    const payments = await models.Transaksi.findAndCountAll({
      where: {
        nasabahId: nasabahId,
        type: 'pembayaran'
      },
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: payments.rows,
      pagination: {
        total: payments.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(payments.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create withdrawal request (karyawan)
router.post('/withdrawal/request', authenticateKaryawan, async (req, res, next) => {
  try {
    const { amount, notes } = req.body;
    const karyawanId = req.user.id;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Check if karyawan has sufficient balance
    const karyawan = await models.Karyawan.findByPk(karyawanId);

    // Calculate available balance
    const totalEarnings = await models.Transaksi.sum('amount', {
      where: {
        karyawanId: karyawanId,
        type: ['pembayaran', 'pemasukan', 'bonus'],
        status: 'completed'
      }
    });

    const totalWithdrawals = await models.Transaksi.sum('amount', {
      where: {
        karyawanId: karyawanId,
        type: 'pencairan',
        status: 'completed'
      }
    });

    const balance = (totalEarnings || 0) - (totalWithdrawals || 0);

    if (amount > balance) {
      return res.status(400).json({
        message: 'Insufficient balance',
        availableBalance: balance,
        requestAmount: amount
      });
    }

    const withdrawal = await qrisService.createWithdrawalRequest(karyawanId, amount, notes);

    // Log audit
    await models.AuditLog.create({
      userId: karyawanId,
      userType: 'karyawan',
      action: 'REQUEST_WITHDRAWAL',
      resourceType: 'Transaksi',
      resourceId: withdrawal.id,
      description: `Withdrawal request: ${amount}`
    });

    res.status(201).json({
      message: 'Withdrawal request created successfully',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
});

// Get withdrawal requests (admin)
router.get('/withdrawals/pending', authenticateAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const withdrawals = await models.Transaksi.findAndCountAll({
      where: {
        type: 'pencairan',
        status: 'pending'
      },
      include: [
        {
          model: models.Karyawan,
          attributes: ['id', 'name', 'email', 'phone', 'bankAccount', 'bankName']
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'ASC']]
    });

    res.json({
      data: withdrawals.rows,
      pagination: {
        total: withdrawals.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(withdrawals.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Approve withdrawal (admin)
router.post('/withdrawals/:id/approve', authenticateAdmin, upload.single('proofPhoto'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const withdrawal = await qrisService.processWithdrawal(id, req.file ? req.file.filename : null);

    // Log audit
    await models.AuditLog.create({
      userId: req.user.id,
      userType: 'admin',
      action: 'APPROVE_WITHDRAWAL',
      resourceType: 'Transaksi',
      resourceId: id,
      description: `Approved withdrawal: ${withdrawal.amount}`
    });

    res.json({
      message: 'Withdrawal approved successfully',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
});

// Reject withdrawal (admin)
router.post('/withdrawals/:id/reject', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const withdrawal = await models.Transaksi.findByPk(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    await withdrawal.update({
      status: 'failed',
      notes: reason || 'Rejected by admin'
    });

    // Log audit
    await models.AuditLog.create({
      userId: req.user.id,
      userType: 'admin',
      action: 'REJECT_WITHDRAWAL',
      resourceType: 'Transaksi',
      resourceId: id,
      description: `Rejected withdrawal: ${withdrawal.amount}`
    });

    res.json({
      message: 'Withdrawal rejected',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
});

// Get karyawan balance
router.get('/balance/karyawan', authenticateKaryawan, async (req, res, next) => {
  try {
    const karyawanId = req.user.id;

    const totalEarnings = await models.Transaksi.sum('amount', {
      where: {
        karyawanId: karyawanId,
        type: ['pembayaran', 'pemasukan', 'bonus'],
        status: 'completed'
      }
    });

    const totalWithdrawals = await models.Transaksi.sum('amount', {
      where: {
        karyawanId: karyawanId,
        type: 'pencairan',
        status: 'completed'
      }
    });

    const pendingWithdrawals = await models.Transaksi.sum('amount', {
      where: {
        karyawanId: karyawanId,
        type: 'pencairan',
        status: 'pending'
      }
    });

    const balance = (totalEarnings || 0) - (totalWithdrawals || 0);
    const availableBalance = balance - (pendingWithdrawals || 0);

    res.json({
      totalEarnings: totalEarnings || 0,
      totalWithdrawals: totalWithdrawals || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      balance: balance,
      availableBalance: availableBalance
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

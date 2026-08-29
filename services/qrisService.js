const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { models } = require('../config/database');

// Parse QRIS code to extract merchant info
const parseQRISCode = (qrisCode) => {
  try {
    // QRIS format parsing
    // This is a simplified parser. Real implementation would need full EMVCo parsing
    const merchantIdMatch = qrisCode.match(/0215(.{20})/);
    const amountMatch = qrisCode.match(/54(\d+)/);
    
    return {
      merchantId: merchantIdMatch ? merchantIdMatch[1] : null,
      amount: amountMatch ? parseInt(amountMatch[1]) : null,
      raw: qrisCode
    };
  } catch (error) {
    throw new Error('Invalid QRIS code format');
  }
};

// Generate payment QRIS
const generatePaymentQRIS = async (nasabah, amount, description) => {
  try {
    if (!nasabah.qrisCode) {
      throw new Error('Nasabah does not have QRIS code');
    }

    const qrisData = parseQRISCode(nasabah.qrisCode);
    
    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(nasabah.qrisCode);

    return {
      qrisCode: nasabah.qrisCode,
      qrImage: qrCodeImage,
      amount: amount,
      description: description,
      merchantId: qrisData.merchantId,
      expiresAt: new Date(Date.now() + 15 * 60000) // 15 minutes
    };
  } catch (error) {
    throw new Error(`Failed to generate payment QRIS: ${error.message}`);
  }
};

// Generate admin withdrawal QRIS
const generateWithdrawalQRIS = async (karyawan, amount, description) => {
  try {
    if (!karyawan.bankAccount) {
      throw new Error('Karyawan does not have bank account information');
    }

    // Create QRIS code for bank transfer
    const referenceNumber = `PUKK${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const qrisContent = `00020101021126570011ID.DANA.WWW0118${karyawan.bankAccount}0203${referenceNumber}5204000053035802ID5904PUKK6015Auto Withdrawal${amount}`;
    
    const qrCodeImage = await QRCode.toDataURL(qrisContent);

    return {
      qrisCode: qrisContent,
      qrImage: qrCodeImage,
      referenceNumber: referenceNumber,
      amount: amount,
      description: description,
      bankAccount: karyawan.bankAccount,
      expiresAt: new Date(Date.now() + 30 * 60000) // 30 minutes
    };
  } catch (error) {
    throw new Error(`Failed to generate withdrawal QRIS: ${error.message}`);
  }
};

// Create payment transaction
const createPaymentTransaction = async (karyawanId, nasabahId, amount, description, qrisCode) => {
  try {
    const transaction = await models.Transaksi.create({
      karyawanId: karyawanId,
      nasabahId: nasabahId,
      type: 'pembayaran',
      amount: amount,
      description: description,
      status: 'pending',
      qrisCode: qrisCode
    });

    // Create payment QRIS record
    const paymentQRIS = await models.PaymentQRIS.create({
      transactionId: transaction.id,
      qrisCode: qrisCode,
      amount: amount,
      status: 'pending',
      referenceNumber: `PAY${Date.now()}`,
      expiresAt: new Date(Date.now() + 15 * 60000)
    });

    return {
      transaction: transaction,
      payment: paymentQRIS
    };
  } catch (error) {
    throw new Error(`Failed to create payment transaction: ${error.message}`);
  }
};

// Confirm payment
const confirmPayment = async (paymentId, proofPhoto = null) => {
  try {
    const payment = await models.PaymentQRIS.findByPk(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'confirmed') {
      throw new Error('Payment already confirmed');
    }

    // Update payment status
    await payment.update({
      status: 'confirmed',
      confirmedAt: new Date(),
      proofOfPayment: proofPhoto
    });

    // Update transaction status
    const transaction = await models.Transaksi.findByPk(payment.transactionId);
    await transaction.update({
      status: 'completed',
      processedAt: new Date()
    });

    // Notify admin about payment
    await notifyAdminAboutPayment(transaction);

    return payment;
  } catch (error) {
    throw new Error(`Failed to confirm payment: ${error.message}`);
  }
};

// Create withdrawal request
const createWithdrawalRequest = async (karyawanId, amount, notes = null) => {
  try {
    const karyawan = await models.Karyawan.findByPk(karyawanId);
    
    if (!karyawan) {
      throw new Error('Karyawan not found');
    }

    const transaction = await models.Transaksi.create({
      karyawanId: karyawanId,
      type: 'pencairan',
      amount: amount,
      description: `Withdrawal request: ${notes || 'No notes'}`,
      status: 'pending',
      notes: notes
    });

    return transaction;
  } catch (error) {
    throw new Error(`Failed to create withdrawal request: ${error.message}`);
  }
};

// Process withdrawal to karyawan account
const processWithdrawal = async (withdrawalId, proofPhoto = null) => {
  try {
    const withdrawal = await models.Transaksi.findByPk(withdrawalId);
    
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error('Invalid withdrawal status');
    }

    // Update withdrawal status
    await withdrawal.update({
      status: 'completed',
      processedAt: new Date(),
      proofPhoto: proofPhoto,
      processedBy: null // Admin ID who processed this
    });

    return withdrawal;
  } catch (error) {
    throw new Error(`Failed to process withdrawal: ${error.message}`);
  }
};

// Check payment status from external service
const checkPaymentStatus = async (referenceNumber) => {
  try {
    // This would integrate with actual QRIS provider API
    // For now, return mock response
    
    const payment = await models.PaymentQRIS.findOne({
      where: { referenceNumber: referenceNumber }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // In real scenario, check with QRIS provider
    // const response = await axios.post(
    //   'https://qris-api.provider.com/check-status',
    //   { reference: referenceNumber },
    //   { headers: { Authorization: `Bearer ${process.env.QRIS_API_KEY}` } }
    // );

    return {
      referenceNumber: payment.referenceNumber,
      status: payment.status,
      amount: payment.amount,
      payer: payment.payer,
      confirmedAt: payment.confirmedAt
    };
  } catch (error) {
    throw new Error(`Failed to check payment status: ${error.message}`);
  }
};

// Notify admin about new payment
const notifyAdminAboutPayment = async (transaction) => {
  try {
    const admins = await models.Admin.findAll({
      where: { isActive: true }
    });

    console.log(`Payment notification: ${transaction.amount} from transaction ${transaction.id}`);
    
    // Send notifications to all admins
    // Email integration could go here
    
    return true;
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};

// Get payment history
const getPaymentHistory = async (nasabahId = null, karyawanId = null, status = null) => {
  try {
    const where = {};
    
    if (nasabahId) where.nasabahId = nasabahId;
    if (karyawanId) where.karyawanId = karyawanId;
    if (status) where.status = status;

    const payments = await models.PaymentQRIS.findAll({
      where: where,
      include: [
        {
          model: models.Transaksi,
          attributes: ['id', 'amount', 'description', 'type']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return payments;
  } catch (error) {
    throw new Error(`Failed to get payment history: ${error.message}`);
  }
};

module.exports = {
  parseQRISCode,
  generatePaymentQRIS,
  generateWithdrawalQRIS,
  createPaymentTransaction,
  confirmPayment,
  createWithdrawalRequest,
  processWithdrawal,
  checkPaymentStatus,
  notifyAdminAboutPayment,
  getPaymentHistory
};

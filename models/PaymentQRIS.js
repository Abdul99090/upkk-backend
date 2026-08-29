const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PaymentQRIS = sequelize.define('PaymentQRIS', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    qrisCode: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    payer: {
      type: DataTypes.STRING
    },
    payerPhone: {
      type: DataTypes.STRING
    },
    payerBank: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'expired'),
      defaultValue: 'pending'
    },
    referenceNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    paymentMethod: {
      type: DataTypes.ENUM('dana', 'gopay', 'ovo', 'linkaja', 'bank_transfer', 'other'),
      defaultValue: 'other'
    },
    proofOfPayment: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    confirmedAt: {
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

  PaymentQRIS.associate = function(models) {
    PaymentQRIS.belongsTo(models.Transaksi, { foreignKey: 'transactionId' });
  };

  return PaymentQRIS;
};

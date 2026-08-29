const MIN_LOAN_AMOUNT = 200000;
const DAILY_INSTALLMENTS = 26;
const WEEKLY_INSTALLMENTS = 6;
const NEW_CUSTOMER_DEDUCTION_RATE = 0.10;

function normalizeLoanAmount(amount) {
  const numeric = Number(amount || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return MIN_LOAN_AMOUNT;
  }

  const rounded = Math.round(numeric / MIN_LOAN_AMOUNT) * MIN_LOAN_AMOUNT;
  return Math.max(MIN_LOAN_AMOUNT, rounded);
}

function calculateLoanPlan({ amount, type = 'daily', isNewCustomer = false }) {
  const normalizedAmount = normalizeLoanAmount(amount);
  const isDaily = type === 'daily';
  const installments = isDaily ? DAILY_INSTALLMENTS : WEEKLY_INSTALLMENTS;

  const deduction = isNewCustomer ? normalizedAmount * NEW_CUSTOMER_DEDUCTION_RATE : 0;
  const disbursement = normalizedAmount - deduction;

  const totalRepayment = normalizedAmount;
  const installmentAmount = Number((totalRepayment / installments).toFixed(2));

  return {
    amount: normalizedAmount,
    deduction,
    disbursement,
    totalRepayment,
    type: isDaily ? 'daily' : 'weekly',
    installments,
    installmentAmount,
    periodLabel: isDaily ? 'harian 26 hari' : 'mingguan 6 kali',
    isNewCustomer,
    notes: isNewCustomer
      ? 'Nasabah baru dikenakan potongan 10% dari nominal pinjaman sebelum pencairan.'
      : 'Nasabah lama tidak dikenakan potongan.'
  };
}

module.exports = {
  MIN_LOAN_AMOUNT,
  DAILY_INSTALLMENTS,
  WEEKLY_INSTALLMENTS,
  NEW_CUSTOMER_DEDUCTION_RATE,
  normalizeLoanAmount,
  calculateLoanPlan,
};

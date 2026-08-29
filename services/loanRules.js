const MIN_LOAN_AMOUNT = 200000;
const DAILY_INSTALLMENTS = 26;
const WEEKLY_INSTALLMENTS = 5;
const NEW_CUSTOMER_DEDUCTION_RATE = 0.10;

function normalizeLoanAmount(amount) {
  const numeric = Number(amount || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return MIN_LOAN_AMOUNT;
  }

  const rounded = Math.round(numeric / MIN_LOAN_AMOUNT) * MIN_LOAN_AMOUNT;
  return Math.max(MIN_LOAN_AMOUNT, rounded);
}

function buildSchedule(type, startDate) {
  const baseDate = startDate ? new Date(startDate) : new Date();
  const installments = type === 'daily' ? DAILY_INSTALLMENTS : WEEKLY_INSTALLMENTS;
  const result = [];

  for (let index = 0; index < installments; index += 1) {
    const current = new Date(baseDate);
    if (type === 'daily') {
      current.setDate(current.getDate() + index);
    } else {
      current.setDate(current.getDate() + (index * 7));
    }

    result.push({
      index: index + 1,
      date: current.toISOString(),
      label: current.toISOString().slice(0, 10),
    });
  }

  return result;
}

function calculateLoanPlan({ amount, type = 'daily', isNewCustomer = false, startDate = null }) {
  const normalizedAmount = normalizeLoanAmount(amount);
  const isDaily = type === 'daily';
  const installments = isDaily ? DAILY_INSTALLMENTS : WEEKLY_INSTALLMENTS;

  const deduction = isNewCustomer && isDaily ? normalizedAmount * NEW_CUSTOMER_DEDUCTION_RATE : 0;
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
    periodLabel: isDaily ? 'harian 26 hari' : 'mingguan 5 kali',
    isNewCustomer,
    schedule: buildSchedule(isDaily ? 'daily' : 'weekly', startDate),
    notes: isNewCustomer && isDaily
      ? 'Nasabah baru harian dikenakan potongan 10% dari nominal pinjaman sebelum pencairan.'
      : 'Nasabah lama atau skema mingguan tidak dikenakan potongan.'
  };
}

module.exports = {
  MIN_LOAN_AMOUNT,
  DAILY_INSTALLMENTS,
  WEEKLY_INSTALLMENTS,
  NEW_CUSTOMER_DEDUCTION_RATE,
  normalizeLoanAmount,
  buildSchedule,
  calculateLoanPlan,
};

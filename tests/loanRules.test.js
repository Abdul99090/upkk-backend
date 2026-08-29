const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateLoanPlan, normalizeLoanAmount } = require('../services/loanRules');

test('normalizeLoanAmount rounds to minimum 200000 increments', () => {
  assert.equal(normalizeLoanAmount(150000), 200000);
  assert.equal(normalizeLoanAmount(200000), 200000);
  assert.equal(normalizeLoanAmount(850000), 800000);
  assert.equal(normalizeLoanAmount(1000000), 1000000);
});

test('daily loan with new customer deducts 10% before disbursement', () => {
  const plan = calculateLoanPlan({ amount: 200000, type: 'daily', isNewCustomer: true });

  assert.equal(plan.disbursement, 180000);
  assert.equal(plan.deduction, 20000);
  assert.equal(plan.installments, 26);
  assert.equal(plan.installmentAmount, 7692.31);
  assert.equal(plan.totalRepayment, 200000);
});

test('weekly loan has no deduction and six equal installments', () => {
  const plan = calculateLoanPlan({ amount: 1000000, type: 'weekly', isNewCustomer: false });

  assert.equal(plan.disbursement, 1000000);
  assert.equal(plan.deduction, 0);
  assert.equal(plan.installments, 6);
  assert.equal(plan.installmentAmount, 166666.67);
  assert.equal(plan.totalRepayment, 1000000);
});

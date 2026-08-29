const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveRoute } = require('../frontend/pukk-mobile/src/services/navigationAssistant.js');

test('admin route resolves to AdminApp', () => {
  assert.equal(resolveRoute({ userToken: 'token', userType: 'admin' }), 'AdminApp');
});

test('karyawan route resolves to KaryawanApp', () => {
  assert.equal(resolveRoute({ userToken: 'token', userType: 'karyawan' }), 'KaryawanApp');
});

test('nasabah route resolves to NasabahApp', () => {
  assert.equal(resolveRoute({ userToken: 'token', userType: 'nasabah' }), 'NasabahApp');
});

test('no token goes to Login', () => {
  assert.equal(resolveRoute({ userToken: null, userType: 'admin' }), 'Login');
});

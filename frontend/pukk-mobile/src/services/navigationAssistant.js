const resolveRoute = ({ userToken, userType, user }) => {
  const effectiveUserType = userType || user?.type || user?.role;

  if (!userToken) {
    return 'Login';
  }

  if (effectiveUserType === 'admin' || effectiveUserType === 'super_admin') {
    return 'AdminApp';
  }

  if (effectiveUserType === 'karyawan') {
    return 'KaryawanApp';
  }

  if (effectiveUserType === 'nasabah') {
    return 'NasabahApp';
  }

  return 'Login';
};

module.exports = {
  resolveRoute,
};

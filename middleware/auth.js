const jwt = require('jsonwebtoken');
const { models } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token not found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token not found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token or insufficient permissions' });
  }
};

const authenticateKaryawan = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token not found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'karyawan') {
      return res.status(403).json({ message: 'Access denied. Karyawan only.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token or insufficient permissions' });
  }
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  authenticateKaryawan
};

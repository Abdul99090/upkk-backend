const express = require('express');
const jwt = require('jsonwebtoken');
const { models } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Admin Login
router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await models.Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Update last login
    await admin.update({ lastLogin: new Date() });

    // Generate token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Karyawan Login
router.post('/karyawan/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const karyawan = await models.Karyawan.findOne({ where: { email } });

    if (!karyawan) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await karyawan.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!karyawan.isActive || karyawan.status === 'inactive') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Update last login
    await karyawan.update({ lastLogin: new Date() });

    // Generate token
    const token = jwt.sign(
      {
        id: karyawan.id,
        email: karyawan.email,
        role: 'karyawan',
        type: 'karyawan'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: karyawan.id,
        name: karyawan.name,
        email: karyawan.email,
        position: karyawan.position
      }
    });
  } catch (error) {
    next(error);
  }
});

// Change Password
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;
    const userType = req.user.type;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const Model = userType === 'admin' ? models.Admin : models.Karyawan;
    const user = await Model.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// Verify Token
router.post('/verify-token', authenticateToken, async (req, res, next) => {
  try {
    res.json({
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh-token', authenticateToken, async (req, res, next) => {
  try {
    const newToken = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        type: req.user.type
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Token refreshed',
      token: newToken
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

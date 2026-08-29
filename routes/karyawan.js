const express = require('express');
const { models } = require('../config/database');
const { authenticateKaryawan } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get karyawan profile
router.get('/profile', authenticateKaryawan, async (req, res, next) => {
  try {
    const karyawan = await models.Karyawan.findByPk(req.user.id, {
      attributes: {
        exclude: ['password']
      }
    });

    if (!karyawan) {
      return res.status(404).json({ message: 'Karyawan not found' });
    }

    res.json({ data: karyawan });
  } catch (error) {
    next(error);
  }
});

// Update karyawan profile
router.put('/profile', authenticateKaryawan, upload.single('profilePhoto'), async (req, res, next) => {
  try {
    const { name, phone, address, bankName, bankAccount, noRekening } = req.body;

    const karyawan = await models.Karyawan.findByPk(req.user.id);

    if (!karyawan) {
      return res.status(404).json({ message: 'Karyawan not found' });
    }

    const updateData = {
      name: name || karyawan.name,
      phone: phone || karyawan.phone,
      address: address || karyawan.address,
      bankName: bankName || karyawan.bankName,
      bankAccount: bankAccount || karyawan.bankAccount,
      noRekening: noRekening || karyawan.noRekening
    };

    if (req.file) {
      updateData.profilePhoto = req.file.filename;
    }

    await karyawan.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      data: karyawan
    });
  } catch (error) {
    next(error);
  }
});

// Absensi
// Check-in
router.post('/absensi/check-in', authenticateKaryawan, upload.single('photo'), async (req, res, next) => {
  try {
    const { lokasiAbsenId, latitude, longitude } = req.body;
    const karyawanId = req.user.id;

    if (!lokasiAbsenId || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lokasi = await models.LokasiAbsen.findByPk(lokasiAbsenId);
    if (!lokasi) {
      return res.status(404).json({ message: 'Lokasi absen not found' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAbsensi = await models.Absensi.findOne({
      where: {
        karyawanId,
        lokasiAbsenId,
        createdAt: {
          [models.sequelize.Op.between]: [today, tomorrow]
        }
      }
    });

    if (existingAbsensi) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Check distance
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(lokasi.latitude),
      parseFloat(lokasi.longitude)
    );

    if (distance > lokasi.radius) {
      return res.status(400).json({
        message: 'Location is outside allowed radius',
        distance,
        radius: lokasi.radius
      });
    }

    // Check if on time
    const now = new Date();
    const checkInTime = new Date(now);
    const [hours, minutes] = lokasi.checkInTime.split(':');
    checkInTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const status = now <= checkInTime ? 'on_time' : 'late';

    const absensi = await models.Absensi.create({
      karyawanId,
      lokasiAbsenId,
      checkInTime: now,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      checkInPhoto: req.file ? req.file.filename : null,
      status,
      distance
    });

    res.status(201).json({
      message: 'Check-in successful',
      data: absensi
    });
  } catch (error) {
    next(error);
  }
});

// Check-out
router.post('/absensi/check-out', authenticateKaryawan, upload.single('photo'), async (req, res, next) => {
  try {
    const { absensiId, latitude, longitude } = req.body;

    const absensi = await models.Absensi.findByPk(absensiId);
    if (!absensi) {
      return res.status(404).json({ message: 'Absensi record not found' });
    }

    if (absensi.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out' });
    }

    await absensi.update({
      checkOutTime: new Date(),
      checkOutPhoto: req.file ? req.file.filename : null
    });

    res.json({
      message: 'Check-out successful',
      data: absensi
    });
  } catch (error) {
    next(error);
  }
});

// Get today's attendance
router.get('/absensi/today', authenticateKaryawan, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const absensi = await models.Absensi.findOne({
      where: {
        karyawanId: req.user.id,
        createdAt: {
          [models.sequelize.Op.between]: [today, tomorrow]
        }
      },
      include: [
        {
          model: models.LokasiAbsen,
          attributes: ['id', 'name', 'latitude', 'longitude', 'address']
        }
      ]
    });

    res.json({
      data: absensi || null
    });
  } catch (error) {
    next(error);
  }
});

// Get attendance history
router.get('/absensi/history', authenticateKaryawan, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = { karyawanId: req.user.id };

    if (startDate && endDate) {
      where.createdAt = {
        [models.sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const absensi = await models.Absensi.findAndCountAll({
      where,
      include: [
        {
          model: models.LokasiAbsen,
          attributes: ['id', 'name', 'address']
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: absensi.rows,
      pagination: {
        total: absensi.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(absensi.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get nasabah list
router.get('/nasabah', authenticateKaryawan, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { karyawanId: req.user.id };

    if (search) {
      where[models.sequelize.Op.or] = [
        { name: { [models.sequelize.Op.iLike]: `%${search}%` } },
        { nik: { [models.sequelize.Op.iLike]: `%${search}%` } },
        { phone: { [models.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) where.status = status;

    const nasabahs = await models.Nasabah.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: nasabahs.rows,
      pagination: {
        total: nasabahs.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(nasabahs.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

module.exports = router;

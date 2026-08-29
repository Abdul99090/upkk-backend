require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const karyawanRoutes = require('./routes/karyawan');
const nasabahRoutes = require('./routes/nasabah');
const paymentRoutes = require('./routes/payment');
const reportRoutes = require('./routes/report');

// Import middleware
const { globalErrorHandler } = require('./middleware/errorHandler');

// Import services
const { startAutoUpdateBot } = require('./services/botService');
const { initializeDatabase } = require('./config/database');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/karyawan', karyawanRoutes);
app.use('/api/nasabah', nasabahRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/report', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(globalErrorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Start auto update bot
    if (process.env.BOT_ENABLED === 'true') {
      startAutoUpdateBot();
      console.log('Auto update bot started');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

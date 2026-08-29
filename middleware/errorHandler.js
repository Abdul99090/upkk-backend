const globalErrorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.details
    });
  }

  // Database error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Duplicate entry',
      field: err.errors[0].path
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  // File upload error
  if (err.message && err.message.includes('File too large')) {
    return res.status(400).json({ message: 'File too large' });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

module.exports = {
  globalErrorHandler,
  AppError
};

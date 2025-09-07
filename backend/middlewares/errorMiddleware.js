const multer = require('multer');

const errorMiddleware = (error, req, res, next) => {
  console.error('Error:', error);

  // Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 50MB.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected file field.' 
      });
    }
    return res.status(400).json({ 
      error: `Upload error: ${error.message}` 
    });
  }

  // Custom application errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.message
    });
  }

  if (error.name === 'DatabaseError') {
    return res.status(500).json({
      error: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }

  // File processing errors
  if (error.message && error.message.includes('Sharp')) {
    return res.status(400).json({
      error: 'Image processing failed. Please check your image format and try again.'
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = errorMiddleware;
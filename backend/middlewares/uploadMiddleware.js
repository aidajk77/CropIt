const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store in memory for processing

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PNG images for main functionality
    if (file.fieldname === 'image') {
      if (file.mimetype === 'image/png') {
        cb(null, true);
      } else {
        cb(new Error('Only PNG images are allowed for main image'));
      }
    }
    // Accept PNG images for logo
    else if (file.fieldname === 'logoImage') {
      if (file.mimetype === 'image/png') {
        cb(null, true);
      } else {
        cb(new Error('Only PNG images are allowed for logo'));
      }
    } else {
      cb(null, true);
    }
  }
});

module.exports = upload;
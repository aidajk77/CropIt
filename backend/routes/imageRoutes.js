const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middlewares/uploadMiddleware');
const { verifyClerkToken, extractUserId } = require('../middlewares/clerkAuth'); // Add this import

// Apply authentication middleware to all routes
router.use(verifyClerkToken);
router.use(extractUserId);

// POST /api/image/preview - Preview image with configuration
router.post('/preview', upload.single('image'), imageController.generatePreview);

// POST /api/image/generate - Generate final image with configuration
router.post('/generate', upload.single('image'), imageController.generateCroppedImage);

module.exports = router;
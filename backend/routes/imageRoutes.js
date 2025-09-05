const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middlewares/uploadMiddleware');

// POST /api/image/preview
router.post('/preview', upload.single('image'), imageController.generatePreview);

// POST /api/image/generate
router.post('/generate', upload.single('image'), imageController.generateCroppedImage);

module.exports = router;
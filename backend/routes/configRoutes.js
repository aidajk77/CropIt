const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const upload = require('../middlewares/uploadMiddleware');

// POST /api/config
router.post('/', upload.single('logoImage'), configController.createConfig);

// PUT /api/config/:id
router.put('/:id', upload.single('logoImage'), configController.updateConfig);

// GET /api/config/:id
router.get('/:id', configController.getConfig);

module.exports = router;
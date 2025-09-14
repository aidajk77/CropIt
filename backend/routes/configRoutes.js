const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const upload = require('../middlewares/uploadMiddleware');
const { verifyClerkToken, extractUserId } = require('../middlewares/clerkAuth'); // Update path as needed

// Apply authentication middleware to all routes
router.use(verifyClerkToken);
router.use(extractUserId);



// POST /api/config - Create new configuration (protected)
router.post('/', upload.single('logoImage'), configController.createConfig);

// PUT /api/config/:id - Update configuration (protected, user-owned only)
router.put('/:id', upload.single('logoImage'), configController.updateConfig);

// GET /api/config/:id - Get specific configuration (protected, user-owned only)
router.get('/:id', configController.getConfig);

// GET /api/config - List all user's configurations (protected)
router.get('/', configController.getAllConfigs);

module.exports = router;
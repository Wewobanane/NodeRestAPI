const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { updateProfileValidation } = require('../middleware/validation');

// User profile routes (protected)
router.put('/profile-update', authenticate, updateProfileValidation, userController.updateProfile);

router.post('/profile/picture',
  authenticate,
  userController.getUploadMiddleware(),
  userController.uploadProfilePicture
);

// Admin routes (protected - in production, add admin role check)
router.patch('/users/:userId/active', authenticate, userController.setActiveStatus);
router.patch('/users/:userId/ban', authenticate, userController.setBannedStatus);

module.exports = router;

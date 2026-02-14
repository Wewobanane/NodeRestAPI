const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const {
  signupValidation,
  loginValidation,
  emailValidation,
  resetPasswordValidation
} = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Local authentication routes
router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);

// Email verification
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', emailValidation, authController.resendVerification);

// Password reset
router.post('/request-password-reset', emailValidation, authController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/failure',
    session: false 
  }),
  authController.oauthCallback
);

// GitHub OAuth
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/api/auth/failure',
    failureMessage: true,
    session: false 
  }),
  authController.oauthCallback
);

// OAuth failure route
router.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'OAuth authentication failed',
    error: 'OAuth authentication failed'
  });
});

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;

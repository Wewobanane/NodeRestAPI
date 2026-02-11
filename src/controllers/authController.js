const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { generateToken: generateRandomToken, getTokenExpiry } = require('../utils/token');
const emailService = require('../services/emailService');

class AuthController {
  // Sign up with email and password
  async signup(req, res) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }     

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await userRepository.create({
        name,
        email,
        password: hashedPassword,
        provider: 'local'
      });

      // Generate email verification token
      const verificationToken = generateRandomToken();
      const expiresAt = getTokenExpiry(24);
      await userRepository.createEmailVerification(user.id, verificationToken, expiresAt);

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken);

      // Generate JWT tokens
      const token = generateToken({ userId: user.id });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Remove password from response
      delete user.password;

      res.status(201).json({
        success: true,
        message: 'User created successfully. Please check your email for verification.',
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during signup',
        error: error.message
      });
    }
  }

  // Sign in with email and password
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userRepository.findByEmail(email);
      if (!user || user.provider !== 'local') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is banned
      if (user.is_banned) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been banned'
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive. Please contact support.'
        });
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT tokens
      const token = generateToken({ userId: user.id });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Remove password from response
      delete user.password;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message
      });
    }
  }

  // OAuth callback handler
  async oauthCallback(req, res) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
      }

      // Check if account is banned
      if (user.is_banned) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been banned'
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive'
        });
      }

      // Generate JWT tokens
      const token = generateToken({ userId: user.id });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Remove password from response
      delete user.password;

      // Return JSON response
      res.status(200).json({
        success: true,
        message: 'OAuth login successful',
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during OAuth authentication'
      });
    }
  }

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      const user = await userRepository.findByEmail(email);
      if (!user || user.provider !== 'local') {
        // Don't reveal if user exists
        return res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        });
      }

      // Generate reset token
      const resetToken = generateRandomToken();
      const expiresAt = getTokenExpiry(1); // 1 hour
      await userRepository.createPasswordReset(user.id, resetToken, expiresAt);

      // Send reset email
      await emailService.sendPasswordResetEmail(email, user.name, resetToken);

      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during password reset request',
        error: error.message
      });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      // Find valid reset token
      const resetRecord = await userRepository.findPasswordReset(token);
      if (!resetRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const hashedPassword = await hashPassword(password);

      // Update password
      await userRepository.updatePassword(resetRecord.user_id, hashedPassword);

      // Delete reset token
      await userRepository.deletePasswordReset(token);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during password reset',
        error: error.message
      });
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required'
        });
      }

      // Find valid verification token
      const verificationRecord = await userRepository.findEmailVerification(token);
      if (!verificationRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      // Verify email
      const user = await userRepository.verifyEmail(verificationRecord.user_id);

      // Delete verification token
      await userRepository.deleteEmailVerification(token);

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.name);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during email verification',
        error: error.message
      });
    }
  }

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If the email exists and is not verified, a verification link has been sent.'
        });
      }

      if (user.is_email_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Generate new verification token
      const verificationToken = generateRandomToken();
      const expiresAt = getTokenExpiry(24);
      await userRepository.createEmailVerification(user.id, verificationToken, expiresAt);

      // Send verification email
      await emailService.sendVerificationEmail(email, user.name, verificationToken);

      res.status(200).json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get current user
  async getMe(req, res) {
    try {
      const user = { ...req.user };
      delete user.password;

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();

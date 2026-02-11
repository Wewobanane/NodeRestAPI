const userRepository = require('../repositories/userRepository');
const { hashPassword } = require('../utils/password');
const { cloudinary, upload } = require('../config/cloudinary');

class UserController {
  // Update profile (name, email, password)
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, email, password } = req.body;

      const updates = {};
      
      if (name) {
        updates.name = name;
      }
      
      if (email) {
        // Normalize email for comparison
        const normalizedEmail = email.toLowerCase().trim();
        const currentEmail = req.user.email.toLowerCase().trim();
        
        if (normalizedEmail !== currentEmail) {
          // Check if email is already taken by another user
          const existingUser = await userRepository.findByEmail(email);
          if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({
              success: false,
              message: 'Email already in use'
            });
          }
          updates.email = email;
        }
      }

      if (password) {
        // Hash the new password
        updates.password = await hashPassword(password);
      }

      const updatedUser = await userRepository.updateProfile(userId, updates);
      delete updatedUser.password;

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Upload profile picture
  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const userId = req.user.id;
      const profilePictureUrl = req.file.path; // Cloudinary URL

      // Delete old profile picture from Cloudinary if exists
      if (req.user.profile_picture && 
          req.user.profile_picture.includes('cloudinary.com')) {
        try {
          // Extract public_id from the URL
          const urlParts = req.user.profile_picture.split('/');
          const filename = urlParts[urlParts.length - 1].split('.')[0];
          const folder = 'AuthApiProfiles';
          const publicId = `${folder}/${filename}`;
          
          await cloudinary.uploader.destroy(publicId);
          console.log('Old profile picture deleted from Cloudinary');
        } catch (deleteError) {
          console.error('Error deleting old profile picture:', deleteError);
          // Continue anyway, don't fail the upload
        }
      }

      const updatedUser = await userRepository.updateProfile(userId, {
        profile_picture: profilePictureUrl
      });
      delete updatedUser.password;

      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Set user active status (admin function)
  async setActiveStatus(req, res) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = await userRepository.setActive(userId, isActive);
      delete updatedUser.password;

      res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedUser
      });
    } catch (error) {
      console.error('Set active status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Ban/unban user (admin function)
  async setBannedStatus(req, res) {
    try {
      const { userId } = req.params;
      const { isBanned } = req.body;

      if (typeof isBanned !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isBanned must be a boolean value'
        });
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = await userRepository.setBanned(userId, isBanned);
      delete updatedUser.password;

      res.status(200).json({
        success: true,
        message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
        data: updatedUser
      });
    } catch (error) {
      console.error('Set banned status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get upload middleware
  getUploadMiddleware() {
    return upload.single('profilePicture');
  }
}

module.exports = new UserController();

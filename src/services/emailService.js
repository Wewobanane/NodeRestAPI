const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.API_URL}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: `"MyApp Authentication" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.API_URL}/api/auth/reset-password?token=${token}`;

    const mailOptions = {
        from: `"MyApp Authentication" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello,</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2196F3; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email) {
    const mailOptions = {
        from: `"MyApp Authentication" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Your email has been verified successfully. You can now enjoy all the features of our platform.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();

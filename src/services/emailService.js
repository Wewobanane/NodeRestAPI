const nodemailer = require('nodemailer');
class EmailService {
  constructor() {
    // Support multiple email providers for production
    const emailProvider = process.env.EMAIL_PROVIDER || 'sendgrid';
    
    let transportConfig;
    
    if (emailProvider === 'sendgrid') {
      // SendGrid configuration (recommended for production)
      transportConfig = {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey', // This is always 'apikey' for SendGrid
          pass: process.env.SENDGRID_API_KEY
        }
      };
    } else if (emailProvider === 'gmail') {
      // Gmail configuration with App Password
      transportConfig = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      };
    } else {
      
      
      transportConfig = {
        host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      };
    }
    
    this.transporter = nodemailer.createTransport(transportConfig);
    
    // Verify connection on startup
    this.verifyConnection();
  }
  
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✓ Email service is ready');
    } catch (error) {
      console.error('✗ Email service connection failed:', error.message);
      console.error('Please check your email configuration (SMTP settings)');
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.API_URL}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"MyApp Authentication" <${process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER}>`,
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

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
      throw new Error('Failed to send verification email. Please try again later.');
    }
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.API_URL}/api/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: `"MyApp Authentication" <${process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER}>`,
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

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send password reset email:', error.message);
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }

  async sendWelcomeEmail(email) {
    const mailOptions = {
      from: `"MyApp Authentication" <${process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER}>`,
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

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
      // Don't throw error for welcome email - it's not critical
      return null;
    }
  }

  async sendCustomEmail({ to, subject, html, text, replyTo }) {
    const mailOptions = {
      from: `"MyApp Authentication" <${process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || '',
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Custom email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send custom email:', error.message);
      throw new Error('Failed to send email. Please try again later.');
    }
  }
}

module.exports = new EmailService();

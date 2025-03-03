import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

/**
 * Email service for sending emails using Nodemailer
 */
export class EmailService {
  constructor() {
    this.from = `HabitJoy <${process.env.EMAIL_FROM}>`;
  }

  /**
   * Create a transporter based on environment
   * @returns {object} - Nodemailer transporter
   */
  createTransporter() {
    // For development/test, use a mock transporter that just logs emails
    return {
      sendMail: (mailOptions) => {
        logger.info(`[MOCK EMAIL] To: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
        logger.info(`[MOCK EMAIL] Text: ${mailOptions.text?.substring(0, 50)}...`);
        
        // Return a mock success response
        return Promise.resolve({
          messageId: `mock-email-${Date.now()}`,
          response: 'Mock email sent successfully'
        });
      }
    };
  }

  /**
   * Send an email
   * @param {object} options - Email options
   * @returns {Promise} - Email sending result
   */
  async send(options) {
    try {
      // 1) Create email transporter
      const transporter = this.createTransporter();

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      // 3) Send email
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param {object} user - User object
   * @param {string} verificationToken - Email verification token
   * @returns {Promise} - Email sending result
   */
  async sendWelcome(user, verificationToken) {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    return this.send({
      to: user.email,
      subject: 'Welcome to HabitJoy! Please verify your email',
      text: `Welcome to HabitJoy, ${user.name}!\n\nPlease verify your email by clicking the link: ${verificationURL}\n\nThis link will expire in 24 hours.\n\nIf you did not sign up for HabitJoy, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Welcome to HabitJoy!</h1>
          <p>Hello ${user.name},</p>
          <p>Thank you for signing up with HabitJoy. To verify your email address, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationURL}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${verificationURL}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not sign up for HabitJoy, please ignore this email.</p>
          <p>Best regards,<br>The HabitJoy Team</p>
        </div>
      `
    });
  }

  /**
   * Send password reset email
   * @param {object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise} - Email sending result
   */
  async sendPasswordReset(user, resetToken) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    return this.send({
      to: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      text: `Forgot your password? Click the link to reset: ${resetURL}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Reset Your Password</h1>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${resetURL}</p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The HabitJoy Team</p>
        </div>
      `
    });
  }

  /**
   * Send order confirmation email
   * @param {object} user - User object
   * @param {object} order - Order object
   * @returns {Promise} - Email sending result
   */
  async sendOrderConfirmation(user, order) {
    return this.send({
      to: user.email,
      subject: `HabitJoy - Order Confirmation #${order._id}`,
      text: `Thank you for your order! Your order #${order._id} has been received and is being processed.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Order Confirmation</h1>
          <p>Hello ${user.name},</p>
          <p>Thank you for your order! Your order has been received and is being processed.</p>
          <h2>Order Details:</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          
          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f7fafc;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #e2e8f0;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.products.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.product.name}</td>
                  <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e2e8f0;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">$${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">$${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <p>You can track your order status in your account dashboard.</p>
          <p>Best regards,<br>The HabitJoy Team</p>
        </div>
      `
    });
  }
}

// Export a singleton instance
export const emailService = new EmailService();
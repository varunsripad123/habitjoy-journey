import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { AppError } from '../middleware/errorHandler.js';
import { emailService } from '../services/emailService.js';
import { stripeService } from '../services/stripeService.js';
import { logger } from '../utils/logger.js';

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * Send JWT token as response
 */
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };
  
  // Set JWT cookie
  res.cookie('jwt', token, cookieOptions);
  
  // Send response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    logger.info('Registration attempt:', { email: req.body.email });
    
    // 1) Create user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role || 'user'
    });
    
    logger.info('User created, creating Stripe customer');
    
    // Skip Stripe customer creation for now due to API issues
    logger.info('Skipping Stripe customer creation due to API key issues');
    // Set a placeholder for the Stripe customer ID
    newUser.stripeCustomerId = 'demo_' + Date.now();
    await newUser.save({ validateBeforeSave: false });
    
    try {
      // 3) Generate email verification token
      const verificationToken = newUser.createEmailVerificationToken();
      await newUser.save({ validateBeforeSave: false });
      
      // 4) Send welcome email with verification link
      await emailService.sendWelcome(newUser, verificationToken);
      logger.info('Welcome email sent');
    } catch (emailError) {
      logger.error('Email verification setup failed:', emailError);
      // Continue with registration even if email verification fails
    }
    
    // 5) Send response
    createSendToken(newUser, 201, req, res);
    
  } catch (error) {
    logger.error('Registration failed:', error);
    next(error);
  }
};

/**
 * Verify email address
 */
export const verifyEmail = async (req, res, next) => {
  try {
    // 1) Get token from request
    const { token } = req.params;
    
    // 2) Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // 3) Find user with matching token and not expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    // 4) If no user found, token is invalid or expired
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    
    // 5) Verify email and remove verification fields
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    // 6) Send response
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    // 1) Check if email and password exist
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    
    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }
    
    // 3) Send token to client
    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = (req, res) => {
  // Clear JWT cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
};

/**
 * Forgot password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with that email address', 404));
    }
    
    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // 3) Send it to user's email
    try {
      await emailService.sendPasswordReset(user, resetToken);
      
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      // If email fails, reset token and save
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      logger.error('Error sending password reset email:', err);
      return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req, res, next) => {
  try {
    // 1) Get token from request params
    const { token } = req.params;
    
    // 2) Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // 3) Find user with matching token and not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    // 4) If no user found, token is invalid or expired
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    
    // 5) Set new password and clear reset fields
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // 6) Send JWT token
    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Update password
 */
export const updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong', 401));
    }
    
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    
    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

/**
 * Update user data (except password)
 */
export const updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user tries to update password
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for password updates. Please use /update-password', 400));
    }
    
    // 2) Filter out unwanted fields that should not be updated
    const allowedFields = ['name', 'email', 'photo'];
    const filteredBody = {};
    Object.keys(req.body).forEach(field => {
      if (allowedFields.includes(field)) {
        filteredBody[field] = req.body[field];
      }
    });
    
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate account
 */
export const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
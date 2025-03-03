import express from 'express';
import jwt from 'jsonwebtoken';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Demo user creation route
router.get('/create-demo-user', async (req, res, next) => {
  try {
    // Import user model directly
    const User = (await import('../models/userModel.js')).default;
    
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: "demo@habitjoy.com" });
    
    if (existingUser) {
      return res.status(200).json({
        status: 'success',
        message: 'Demo user already exists',
        email: "demo@habitjoy.com",
        password: "password123"
      });
    }
    
    // Create new demo user directly
    const demoUser = await User.create({
      name: "Demo User",
      email: "demo@habitjoy.com",
      password: "password123",
      passwordConfirm: "password123",
      role: "user",
      stripeCustomerId: "demo_" + Date.now() // Add stripe customer ID so it doesn't fail
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Demo user created successfully',
      email: demoUser.email,
      password: "password123"
    });
  } catch (error) {
    console.error('Error creating demo user:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Failed to create demo user'
    });
  }
});

// Simple register route without Stripe/email for debugging
router.post('/simple-register', async (req, res) => {
  try {
    const User = (await import('../models/userModel.js')).default;
    
    // Create user with minimal verification
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: 'user',
      stripeCustomerId: 'simple_' + Date.now()
    });
    
    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    // Remove password from output
    newUser.password = undefined;
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    console.error('Simple registration error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Registration failed'
    });
  }
});

// Protected routes (require authentication)
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);
router.patch('/update-me', authController.updateMe);
router.delete('/delete-me', authController.deleteMe);

export default router;
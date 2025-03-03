import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Stripe webhook - this should be public
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

// All other routes require authentication
router.use(protect);

// Order and payment routes
router.post('/create-order', paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);

// Subscription routes
router.post('/create-subscription', paymentController.createSubscription);
router.delete('/cancel-subscription/:subscriptionId', paymentController.cancelSubscription);

// Refund routes (only admin can create refunds)
router.post('/refund', restrictTo('admin'), paymentController.createRefund);

export default router;
import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// User routes
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', orderController.getAllOrders);
router.get('/user/:userId', orderController.getUserOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

export default router;
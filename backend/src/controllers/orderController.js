import Order from '../models/orderModel.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Get all orders for a specific user
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Check if user is requesting their own orders or if admin is requesting another user's orders
    if (req.params.userId && req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to access these orders', 403));
    }
    
    const orders = await Order.find({ user: userId }).sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    // 1) Build query
    const queryObj = { ...req.query };
    
    // Exclude special fields
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // 2) Execute query
    let query = Order.find(JSON.parse(queryStr));
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    
    // 3) Execute query
    const orders = await query;
    
    // 4) Send response
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 */
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }
    
    // Check if user is requesting their own order or if admin is requesting another user's order
    if (order.user.id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to access this order', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return next(new AppError('Status is required', 400));
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};
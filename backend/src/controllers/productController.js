import Product from '../models/productModel.js';
import { AppError } from '../middleware/errorHandler.js';
import { stripeService } from '../services/stripeService.js';
import { logger } from '../utils/logger.js';

/**
 * Get all products
 */
export const getAllProducts = async (req, res, next) => {
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
    let query = Product.find(JSON.parse(queryStr));
    
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
    const products = await query;
    
    // 4) Send response
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product
 */
export const createProduct = async (req, res, next) => {
  try {
    // 1) Create product in database
    const newProduct = await Product.create(req.body);
    
    // 2) Create product in Stripe
    const stripeProduct = await stripeService.createProduct(newProduct);
    newProduct.stripeProductId = stripeProduct.id;
    
    // 3) Create price in Stripe
    const isSubscription = newProduct.category === 'subscription';
    const stripePrice = await stripeService.createPrice(
      stripeProduct.id,
      newProduct.price,
      'usd',
      isSubscription
    );
    
    newProduct.stripePriceId = stripePrice.id;
    await newProduct.save();
    
    // 4) Send response
    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });
  } catch (error) {
    logger.error('Error creating product:', error);
    next(error);
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }
    
    // Update product in Stripe if needed
    // Note: For price updates, consider creating a new price in Stripe rather than updating existing ones
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }
    
    // Deactivate product in Stripe if needed
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
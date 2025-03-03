import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { AppError } from '../middleware/errorHandler.js';
import { stripeService } from '../services/stripeService.js';
import { emailService } from '../services/emailService.js';
import { logger } from '../utils/logger.js';

/**
 * Create order and payment intent
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      products,
      shippingAddress,
      billingAddress,
      paymentMethod = 'stripe'
    } = req.body;
    
    if (!products || !products.length) {
      return next(new AppError('No products provided', 400));
    }
    
    // 1) Validate products and get details
    const productItems = [];
    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return next(new AppError(`Product with ID ${item.productId} not found`, 404));
      }
      
      if (product.stockQuantity < item.quantity) {
        return next(new AppError(`Not enough stock for product: ${product.name}`, 400));
      }
      
      productItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }
    
    // 2) Calculate total amount
    const totalAmount = Order.calculateTotalAmount(productItems);
    
    // 3) Get user's Stripe customer ID or create one
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId && paymentMethod === 'stripe') {
      const customer = await stripeService.createCustomer(user);
      user.stripeCustomerId = customer.id;
      await user.save({ validateBeforeSave: false });
    }
    
    // 4) Create order in database
    const order = await Order.create({
      user: req.user.id,
      products: productItems,
      totalAmount,
      status: 'pending',
      paymentMethod,
      shippingAddress,
      billingAddress
    });
    
    // 5) Create payment intent based on payment method
    let paymentData = {};
    
    if (paymentMethod === 'stripe') {
      const paymentIntent = await stripeService.createPaymentIntent(
        totalAmount,
        'usd',
        user.stripeCustomerId,
        { orderId: order._id.toString() }
      );
      
      order.paymentIntentId = paymentIntent.id;
      await order.save();
      
      paymentData = {
        clientSecret: paymentIntent.client_secret
      };
    }
    
    // 6) Send response
    res.status(201).json({
      status: 'success',
      data: {
        order,
        payment: paymentData
      }
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    next(error);
  }
};

/**
 * Verify payment and update order status
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return next(new AppError('Payment intent ID is required', 400));
    }
    
    // 1) Find order by payment intent ID
    const order = await Order.findOne({ paymentIntentId });
    
    if (!order) {
      return next(new AppError('Order not found for this payment', 404));
    }
    
    // 2) Update order status
    order.status = 'paid';
    await order.save();
    
    // 3) Update product stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      product.stockQuantity -= item.quantity;
      await product.save();
    }
    
    // 4) Send order confirmation email
    const user = await User.findById(order.user);
    await emailService.sendOrderConfirmation(user, order);
    
    // 5) Send response
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    logger.error('Error verifying payment:', error);
    next(error);
  }
};

/**
 * Create subscription
 */
export const createSubscription = async (req, res, next) => {
  try {
    const { priceId } = req.body;
    
    if (!priceId) {
      return next(new AppError('Price ID is required', 400));
    }
    
    // 1) Get user and their Stripe customer ID
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      const customer = await stripeService.createCustomer(user);
      user.stripeCustomerId = customer.id;
      await user.save({ validateBeforeSave: false });
    }
    
    // 2) Create subscription
    const subscription = await stripeService.createSubscription(
      user.stripeCustomerId,
      priceId,
      { userId: user._id.toString() }
    );
    
    // 3) Send response
    res.status(200).json({
      status: 'success',
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      }
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    next(error);
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    
    if (!subscriptionId) {
      return next(new AppError('Subscription ID is required', 400));
    }
    
    // 1) Cancel subscription
    await stripeService.cancelSubscription(subscriptionId);
    
    // 2) Send response
    res.status(200).json({
      status: 'success',
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    next(error);
  }
};

/**
 * Process stripe webhook
 */
export const stripeWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      logger.error('Webhook Error: No Stripe signature provided');
      return res.status(400).json({ status: 'error', message: 'Webhook Error: No signature provided' });
    }
    
    // 1) Construct and verify the event
    const event = await stripeService.constructEventFromWebhook(req.body, signature);
    
    // 2) Handle events based on type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
    
    // 3) Send response
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook Error:', error.message);
    return res.status(400).json({ status: 'error', message: `Webhook Error: ${error.message}` });
  }
};

/**
 * Handle payment intent succeeded webhook
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    logger.info(`PaymentIntent succeeded: ${paymentIntent.id}`);
    
    // Find order by payment intent ID
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
    
    if (!order) {
      logger.warn(`No order found for payment intent: ${paymentIntent.id}`);
      return;
    }
    
    // Update order status
    order.status = 'paid';
    await order.save();
    
    // Update product stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      product.stockQuantity -= item.quantity;
      await product.save();
    }
    
    // Send order confirmation email
    const user = await User.findById(order.user);
    await emailService.sendOrderConfirmation(user, order);
  } catch (error) {
    logger.error('Error handling payment intent succeeded webhook:', error);
  }
}

/**
 * Handle payment intent failed webhook
 */
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    logger.info(`PaymentIntent failed: ${paymentIntent.id}`);
    
    // Find order by payment intent ID
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
    
    if (!order) {
      logger.warn(`No order found for payment intent: ${paymentIntent.id}`);
      return;
    }
    
    // Update order status
    order.status = 'cancelled';
    await order.save();
  } catch (error) {
    logger.error('Error handling payment intent failed webhook:', error);
  }
}

/**
 * Handle invoice payment succeeded webhook
 */
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    logger.info(`Invoice payment succeeded: ${invoice.id}`);
    
    // Handle subscription payment success
    if (invoice.subscription) {
      // You could record the payment or update user subscription status
      logger.info(`Subscription payment succeeded for subscription: ${invoice.subscription}`);
    }
  } catch (error) {
    logger.error('Error handling invoice payment succeeded webhook:', error);
  }
}

/**
 * Handle invoice payment failed webhook
 */
async function handleInvoicePaymentFailed(invoice) {
  try {
    logger.info(`Invoice payment failed: ${invoice.id}`);
    
    // You could notify the user or take action on failed subscription payment
    if (invoice.subscription) {
      logger.info(`Subscription payment failed for subscription: ${invoice.subscription}`);
    }
  } catch (error) {
    logger.error('Error handling invoice payment failed webhook:', error);
  }
}

/**
 * Handle subscription created webhook
 */
async function handleSubscriptionCreated(subscription) {
  try {
    logger.info(`Subscription created: ${subscription.id}`);
    
    // The userId should be in the metadata
    if (subscription.metadata && subscription.metadata.userId) {
      const userId = subscription.metadata.userId;
      const user = await User.findById(userId);
      
      if (user) {
        // Update user role to premium
        user.role = 'premium';
        await user.save({ validateBeforeSave: false });
        logger.info(`User ${userId} updated to premium role`);
      }
    }
  } catch (error) {
    logger.error('Error handling subscription created webhook:', error);
  }
}

/**
 * Handle subscription updated webhook
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    logger.info(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
    
    // Handle subscription status changes
    if (subscription.metadata && subscription.metadata.userId) {
      const userId = subscription.metadata.userId;
      const user = await User.findById(userId);
      
      if (user && subscription.status === 'canceled') {
        // Downgrade user from premium if subscription is canceled
        user.role = 'user';
        await user.save({ validateBeforeSave: false });
        logger.info(`User ${userId} downgraded from premium role`);
      }
    }
  } catch (error) {
    logger.error('Error handling subscription updated webhook:', error);
  }
}

/**
 * Handle subscription deleted webhook
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    logger.info(`Subscription deleted: ${subscription.id}`);
    
    // The userId should be in the metadata
    if (subscription.metadata && subscription.metadata.userId) {
      const userId = subscription.metadata.userId;
      const user = await User.findById(userId);
      
      if (user) {
        // Downgrade user from premium
        user.role = 'user';
        await user.save({ validateBeforeSave: false });
        logger.info(`User ${userId} downgraded from premium role due to subscription deletion`);
      }
    }
  } catch (error) {
    logger.error('Error handling subscription deleted webhook:', error);
  }
}

/**
 * Create refund
 */
export const createRefund = async (req, res, next) => {
  try {
    const { orderId, amount, reason } = req.body;
    
    if (!orderId) {
      return next(new AppError('Order ID is required', 400));
    }
    
    // 1) Find order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    if (!order.paymentIntentId) {
      return next(new AppError('This order does not have a payment intent ID', 400));
    }
    
    // 2) Check if order is already refunded
    if (order.status === 'refunded') {
      return next(new AppError('This order has already been refunded', 400));
    }
    
    // 3) Create refund with Stripe
    await stripeService.createRefund(order.paymentIntentId, amount || null);
    
    // 4) Update order status
    order.status = 'refunded';
    order.refundedAt = Date.now();
    await order.save();
    
    // 5) Send response
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    logger.error('Error creating refund:', error);
    next(error);
  }
};
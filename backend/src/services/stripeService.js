import Stripe from 'stripe';
import { logger } from '../utils/logger.js';

/**
 * Stripe Payment Service
 * Handles interactions with the Stripe API
 */
export class StripeService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16', // Specify the API version
    });
    // Log initialization with key hint
    const keyHint = process.env.STRIPE_SECRET_KEY ? 
      `${process.env.STRIPE_SECRET_KEY.substring(0, 8)}...` : 'missing';
    logger.info(`Stripe service initialized with key: ${keyHint}`);
  }

  /**
   * Create a Stripe customer
   * @param {object} user - User object
   * @returns {object} - Stripe customer object
   */
  async createCustomer(user) {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      logger.info(`Stripe customer created for user ${user._id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Create a payment intent for one-time payments
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code (default: usd)
   * @param {string} customerId - Stripe customer ID
   * @param {object} metadata - Additional metadata
   * @returns {object} - Stripe payment intent
   */
  async createPaymentIntent(amount, currency = 'usd', customerId, metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Create a product in Stripe
   * @param {object} product - Product object
   * @returns {object} - Stripe product
   */
  async createProduct(product) {
    try {
      const stripeProduct = await this.stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: {
          productId: product._id.toString()
        },
        images: product.images,
        active: product.active
      });
      
      logger.info(`Stripe product created: ${stripeProduct.id}`);
      return stripeProduct;
    } catch (error) {
      logger.error('Error creating Stripe product:', error);
      throw error;
    }
  }

  /**
   * Create a price for a product in Stripe
   * @param {string} productId - Stripe product ID
   * @param {number} unitAmount - Price in cents
   * @param {string} currency - Currency code (default: usd)
   * @param {boolean} recurring - Whether the price is recurring
   * @returns {object} - Stripe price
   */
  async createPrice(productId, unitAmount, currency = 'usd', recurring = false) {
    try {
      const priceData = {
        product: productId,
        unit_amount: Math.round(unitAmount * 100), // Convert to cents
        currency
      };
      
      // Add recurring data if this is a subscription
      if (recurring) {
        priceData.recurring = {
          interval: 'month',  // or 'day', 'week', 'year'
        };
      }
      
      const price = await this.stripe.prices.create(priceData);
      
      logger.info(`Stripe price created: ${price.id}`);
      return price;
    } catch (error) {
      logger.error('Error creating Stripe price:', error);
      throw error;
    }
  }

  /**
   * Create a subscription for a customer
   * @param {string} customerId - Stripe customer ID
   * @param {string} priceId - Stripe price ID
   * @param {object} metadata - Additional metadata
   * @returns {object} - Stripe subscription
   */
  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });
      
      logger.info(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   * @param {string} subscriptionId - Stripe subscription ID
   * @returns {object} - Canceled Stripe subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      logger.info(`Subscription canceled: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error(`Error canceling subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  /**
   * Process a webhook event
   * @param {string} payload - Request body
   * @param {string} signature - Stripe signature header
   * @returns {object} - Stripe event
   */
  async constructEventFromWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      logger.info(`Webhook received: ${event.type}`);
      return event;
    } catch (error) {
      logger.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  /**
   * Create a refund
   * @param {string} paymentIntentId - Payment intent ID
   * @param {number} amount - Amount to refund in cents (optional)
   * @returns {object} - Stripe refund
   */
  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };
      
      // If amount specified, add it to the refund data
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }
      
      const refund = await this.stripe.refunds.create(refundData);
      
      logger.info(`Refund created: ${refund.id} for payment intent ${paymentIntentId}`);
      return refund;
    } catch (error) {
      logger.error(`Error creating refund for payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const stripeService = new StripeService();
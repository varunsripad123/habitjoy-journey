import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as paymentController from '../../controllers/paymentController.js';
import { stripeService } from '../../services/stripeService.js';
import { emailService } from '../../services/emailService.js';
import User from '../../models/userModel.js';
import Product from '../../models/productModel.js';
import Order from '../../models/orderModel.js';

// Mock required services and dependencies
jest.mock('../../services/stripeService.js', () => ({
  stripeService: {
    createPaymentIntent: jest.fn().mockResolvedValue({
      id: 'pi_mock123',
      client_secret: 'pi_mock123_secret_123'
    }),
    createSubscription: jest.fn().mockResolvedValue({
      id: 'sub_mock123',
      latest_invoice: {
        payment_intent: {
          client_secret: 'pi_mock123_secret_123'
        }
      }
    }),
    cancelSubscription: jest.fn().mockResolvedValue({}),
    createRefund: jest.fn().mockResolvedValue({
      id: 'ref_mock123'
    }),
    constructEventFromWebhook: jest.fn().mockResolvedValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_mock123'
        }
      }
    })
  }
}));

jest.mock('../../services/emailService.js', () => ({
  emailService: {
    sendOrderConfirmation: jest.fn().mockResolvedValue({})
  }
}));

// Mock request and response objects
const mockRequest = (body = {}, params = {}, user = null, headers = {}) => ({
  body,
  params,
  user: user || { id: 'user123' },
  headers
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn();

describe('Payment Controller', () => {
  let mongoServer;
  let testUser;
  let testProduct;

  // Set up MongoDB Memory Server before tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Set up test data before each test
  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    jest.clearAllMocks();

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      stripeCustomerId: 'cus_mock123'
    });

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test product description',
      price: 29.99,
      category: 'one-time',
      features: ['Feature 1', 'Feature 2'],
      stockQuantity: 10
    });
  });

  describe('createOrder', () => {
    it('should create an order and return payment intent', async () => {
      const req = mockRequest({
        products: [
          {
            productId: testProduct._id.toString(),
            quantity: 2
          }
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'stripe'
      }, {}, testUser);
      const res = mockResponse();

      await paymentController.createOrder(req, res, mockNext);

      // Check that payment intent was created
      expect(stripeService.createPaymentIntent).toHaveBeenCalled();

      // Check that order was created in database
      const orders = await Order.find({});
      expect(orders.length).toBe(1);
      expect(orders[0].user.toString()).toBe(testUser._id.toString());
      expect(orders[0].products.length).toBe(1);
      expect(orders[0].products[0].quantity).toBe(2);
      expect(orders[0].totalAmount).toBe(59.98); // 29.99 * 2

      // Check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            payment: {
              clientSecret: 'pi_mock123_secret_123'
            }
          })
        })
      );
    });

    it('should return error if product does not exist', async () => {
      const req = mockRequest({
        products: [
          {
            productId: new mongoose.Types.ObjectId().toString(),
            quantity: 2
          }
        ],
        paymentMethod: 'stripe'
      }, {}, testUser);
      const res = mockResponse();

      await paymentController.createOrder(req, res, mockNext);

      // Check that error was passed to next
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeTruthy();
      expect(error.message).toContain('Product with ID');
      expect(error.message).toContain('not found');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment and update order status', async () => {
      // Create a test order
      const order = await Order.create({
        user: testUser._id,
        products: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        totalAmount: testProduct.price * 2,
        status: 'pending',
        paymentMethod: 'stripe',
        paymentIntentId: 'pi_mock123'
      });

      const req = mockRequest({
        paymentIntentId: 'pi_mock123'
      });
      const res = mockResponse();

      await paymentController.verifyPayment(req, res, mockNext);

      // Check that order status was updated
      const updatedOrder = await Order.findById(order._id);
      expect(updatedOrder.status).toBe('paid');

      // Check that product stock was updated
      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.stockQuantity).toBe(8); // 10 - 2

      // Check that email was sent
      expect(emailService.sendOrderConfirmation).toHaveBeenCalled();

      // Check response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription and return client secret', async () => {
      const req = mockRequest({
        priceId: 'price_mock123'
      }, {}, testUser);
      const res = mockResponse();

      await paymentController.createSubscription(req, res, mockNext);

      // Check that subscription was created
      expect(stripeService.createSubscription).toHaveBeenCalledWith(
        'cus_mock123',
        'price_mock123',
        { userId: testUser._id.toString() }
      );

      // Check response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: {
            subscriptionId: 'sub_mock123',
            clientSecret: 'pi_mock123_secret_123'
          }
        })
      );
    });
  });

  describe('stripeWebhook', () => {
    it('should process webhook event and return success', async () => {
      // Create a test order
      const order = await Order.create({
        user: testUser._id,
        products: [
          {
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        totalAmount: testProduct.price * 2,
        status: 'pending',
        paymentMethod: 'stripe',
        paymentIntentId: 'pi_mock123'
      });

      const req = mockRequest(
        'webhook_body',
        {},
        null,
        { 'stripe-signature': 'signature123' }
      );
      const res = mockResponse();

      await paymentController.stripeWebhook(req, res);

      // Check that webhook event was constructed
      expect(stripeService.constructEventFromWebhook).toHaveBeenCalledWith(
        'webhook_body',
        'signature123'
      );

      // Check response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });
  });
});
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import User from '../../models/userModel.js';
import * as authController from '../../controllers/authController.js';
import { stripeService } from '../../services/stripeService.js';
import { emailService } from '../../services/emailService.js';

// Mock required services and dependencies
jest.mock('../../services/stripeService.js', () => ({
  stripeService: {
    createCustomer: jest.fn().mockResolvedValue({ id: 'cus_mock123' })
  }
}));

jest.mock('../../services/emailService.js', () => ({
  emailService: {
    sendWelcome: jest.fn().mockResolvedValue({}),
    sendPasswordReset: jest.fn().mockResolvedValue({})
  }
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn()
}));

// Mock request and response objects
const mockRequest = (body = {}, params = {}, user = null) => ({
  body,
  params,
  user,
  secure: false,
  headers: {},
  cookie: jest.fn()
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn();

describe('Auth Controller', () => {
  let mongoServer;

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

  // Clean up the users collection before each test
  beforeEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return 201 status', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });
      const res = mockResponse();

      await authController.register(req, res, mockNext);

      // Check that user was created
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');

      // Check that stripe customer was created
      expect(stripeService.createCustomer).toHaveBeenCalled();
      expect(user.stripeCustomerId).toBe('cus_mock123');

      // Check that welcome email was sent
      expect(emailService.sendWelcome).toHaveBeenCalled();

      // Check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          token: 'mock_token'
        })
      );
    });

    it('should return error if password confirmation does not match', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'different_password'
      });
      const res = mockResponse();

      await authController.register(req, res, mockNext);

      // Check that error was passed to next
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeTruthy();
      expect(error.message).toContain('Passwords do not match');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      // Create a user first
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });

      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.login(req, res, mockNext);

      // Check response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          token: 'mock_token'
        })
      );
    });

    it('should return error with incorrect password', async () => {
      // Create a user first
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });

      const req = mockRequest({
        email: 'test@example.com',
        password: 'wrong_password'
      });
      const res = mockResponse();

      await authController.login(req, res, mockNext);

      // Check that error was passed to next
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeTruthy();
      expect(error.message).toBe('Incorrect email or password');
    });
  });

  describe('forgotPassword', () => {
    it('should send reset token to user email', async () => {
      // Create a user first
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });

      const req = mockRequest({
        email: 'test@example.com'
      });
      const res = mockResponse();

      await authController.forgotPassword(req, res, mockNext);

      // Check that password reset token was generated
      const updatedUser = await User.findOne({ email: 'test@example.com' });
      expect(updatedUser.passwordResetToken).toBeTruthy();
      expect(updatedUser.passwordResetExpires).toBeTruthy();

      // Check that email was sent
      expect(emailService.sendPasswordReset).toHaveBeenCalled();

      // Check response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Token sent to email!'
        })
      );
    });
  });
});
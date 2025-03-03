# HabitJoy Backend API

This is the backend API for the HabitJoy application, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with email verification
- **Payment Processing**: Integration with Stripe for handling payments
- **Database Management**: MongoDB with Mongoose for data modeling
- **API Endpoints**: RESTful API for users, products, orders, and payments
- **Security**: Implementation of best practices for securing the API
- **Testing**: Unit and integration tests using Jest
- **Deployment**: Docker configuration for easy deployment

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Stripe account for payment processing
- (Optional) Docker and Docker Compose for containerized development

## Getting Started

### Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/habitjoy-journey.git
   cd habitjoy-journey/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file by copying the example:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Set up MongoDB connection string
   - Add your JWT secret
   - Configure Stripe API keys
   - Set up email service credentials

5. Start the development server:
   ```
   npm run dev
   ```

### Docker Development Setup

1. Make sure Docker and Docker Compose are installed on your system.

2. Start the containerized development environment:
   ```
   docker-compose up -d
   ```

This will start:
- Node.js API server on port 5000
- MongoDB on port 27017
- Mongo Express (MongoDB web UI) on port 8081

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `PATCH /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email address
- `GET /api/auth/me` - Get current user (protected)
- `PATCH /api/auth/update-password` - Update password (protected)
- `PATCH /api/auth/update-me` - Update user data (protected)
- `DELETE /api/auth/delete-me` - Deactivate account (protected)

### Product Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PATCH /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Order Endpoints

- `GET /api/orders/my-orders` - Get current user's orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/user/:userId` - Get user's orders (admin only)
- `PATCH /api/orders/:id/status` - Update order status (admin only)

### Payment Endpoints

- `POST /api/payment/create-order` - Create order and payment (protected)
- `POST /api/payment/verify-payment` - Verify payment (protected)
- `POST /api/payment/create-subscription` - Create subscription (protected)
- `DELETE /api/payment/cancel-subscription/:subscriptionId` - Cancel subscription (protected)
- `POST /api/payment/refund` - Create refund (admin only)
- `POST /api/payment/webhook` - Stripe webhook (public)

## Testing

Run tests with:

```
npm test
```

For watching mode:

```
npm run test:watch
```

## Deployment

The application can be deployed using Docker. The included Dockerfile and GitHub Actions workflow provides a starting point for CI/CD deployment.

## License

This project is licensed under the MIT License.
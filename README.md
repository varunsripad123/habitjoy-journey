# HabitJoy - A comprehensive habit tracking and personal development platform
# HabitJoy

A modern web application for habit tracking, journaling, and mental health monitoring, with integrated e-commerce capabilities.

## Project Structure

- **Frontend**: React + TypeScript SPA with modern UI components (shadcn-ui + Tailwind CSS)
- **Backend**: Node.js + Express + MongoDB API with authentication and payment processing

## Features

### Frontend
- User authentication and profile management
- Habit tracking with streak counting
- Journal entries with reflection prompts
- Mood tracking and visualization
- E-commerce store for premium features and physical products

### Backend
- Secure user authentication with JWT
- Role-based access control
- Payment processing with Stripe
- Order management system
- Email notifications for account events and orders
- Comprehensive API for all application features

## Running the Application

### Important Update: The Stripe API Key has been updated
The application now uses a valid Stripe test API key for payment processing.

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Start MongoDB (using Docker or a local installation):
   ```bash
   # With Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Running the Frontend

1. Navigate to the frontend directory (this is the root directory):
   ```bash
   # You're already here if at the repository root
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (or the URL shown in the terminal) in your browser.

### Common Issues & Solutions

- **Permission Errors with npm**: If you encounter permission errors when running npm commands, try:
  ```bash
  sudo npm install --unsafe-perm
  ```
  
- **MongoDB Connection Issues**: Make sure MongoDB is running. You can check with:
  ```bash
  mongo --eval "db.adminCommand('ping')"
  ```

- **Port Already in Use**: If port 5000 (backend) or 3000 (frontend) is already in use, modify the port in:
  - Backend: .env file (PORT variable)
  - Frontend: vite.config.ts (server.port option)

## Testing Stripe Integration

For testing the payment integration, use these Stripe test card numbers:

- **Success**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 0002

Use any future expiration date, any 3-digit CVC, and any postal code.

## API Documentation

The backend API provides endpoints for:

- User authentication and management
- Product catalog and management
- Order processing and history
- Payment processing with Stripe
- Subscription management

Main endpoints:

- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - User login
- `GET /api/products` - Get all products
- `POST /api/payment/create-order` - Create a new order
- `POST /api/payment/create-subscription` - Create a subscription

See the [backend README](./backend/README.md) for detailed API documentation.

## Technologies Used

This project is built with:

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Stripe Elements for payment processing

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Stripe API for payments
- Nodemailer for email notifications
- Jest for testing

## License

This project is licensed under the MIT License.
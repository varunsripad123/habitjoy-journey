# HabitJoy Application Demo Guide

Since we've encountered some environment setup issues, this guide will help you understand how to run the application properly on a clean environment.

## Prerequisites

1. **Node.js and npm**: Version 18+ recommended
2. **MongoDB**: Running locally or accessible via connection string
3. **Proper npm permissions**: Ensure your user has write access to npm cache

## Application Structure

The application consists of:

1. **Frontend**: React + TypeScript + Vite application (root directory)
2. **Backend**: Node.js + Express + MongoDB (backend directory)

## Running the Application

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file to include:
# - MongoDB connection string
# - JWT secret
# - Stripe API keys (already added)

# Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start backend server
npm run dev
```

### Frontend Setup

```bash
# In the root directory
npm install

# Start frontend development server
npm run dev
```

## Key Integration Points

### 1. Authentication Flow

- User registration: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- JWT token handling in `src/context/AuthContext.tsx`
- Protected routes in `src/components/auth/ProtectedRoute.tsx`

### 2. Stripe Payment Integration

- Frontend Elements integration in `src/components/payment/StripePaymentForm.tsx`
- Stripe API key: `pk_test_51Qydy14fWM471SM6QekN5hz7Q15wbEWaTFcBtU66YWEO7LHWZ7GJPcP0LUpx7dyd08C5aUTkji8zHfoc5a8nv5hV00mqOSzpfr`
- Stripe Secret key in backend `.env`: `sk_test_51Qydy14fWM471SM6QssnuLOeh7wk4JFftDtgU6Wlsm8LfWMAYPUku26gK6jobHehUiwhmBxXPwqo7ivY1qCAUkAr00wpQ6St7a`
- Payment processing in `src/pages/Shop.tsx`
- Backend payment endpoints in `backend/src/controllers/paymentController.js`

### 3. Data Visualization

- User statistics in `src/pages/Stats.tsx`
- Data visualization with custom chart components
- Time-based data filtering

### 4. API Endpoints

The backend provides these key endpoints:

- Authentication: `/api/auth/*`
- Products: `/api/products/*`
- Orders: `/api/orders/*`
- Payments: `/api/payment/*`

## Testing the Application

1. Register a new account or use demo account:
   - Email: demo@habitjoy.com
   - Password: password123

2. Track your mood and habits on the dashboard

3. View statistics on the Stats page

4. Try premium subscription using test card:
   - Card number: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits

## Troubleshooting

If you encounter permission issues with npm:
```bash
# Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm
```

If MongoDB connection fails:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

## Next Steps

1. Deploy the backend to a service like AWS, GCP, or Heroku
2. Deploy the frontend to Vercel, Netlify, or similar
3. Set up proper environment variables for production
4. Configure Stripe webhooks for production

For any questions or issues, refer to the main README file or contact support.
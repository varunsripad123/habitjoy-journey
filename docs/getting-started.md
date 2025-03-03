# Getting Started with HabitJoy

This guide will help you set up and run the HabitJoy application in its current state. The application consists of a React frontend and an Express.js backend.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or Docker)

## Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

4. Update the following fields in the `.env` file:
   ```
   JWT_SECRET=any_secure_random_string_for_development
   MONGODB_URI=mongodb://localhost:27017/habitjoy
   ```

5. Make sure MongoDB is running. If using Docker, you can start it with:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```
   
   Or if you have MongoDB installed locally, ensure the service is running.

6. Start the backend server:
   ```bash
   npm run dev
   ```

7. The backend should now be running at http://localhost:5000

## Running the Frontend

1. Open a new terminal window and navigate to the project root directory.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

4. The frontend should now be running at http://localhost:8080 or whichever port is displayed in your terminal.

## Using the Demo Account

Once both the frontend and backend are running, you can use the demo account:

- Email: demo@habitjoy.com
- Password: password123

If the demo account doesn't work, you can create a new account through the registration form.

## Creating a Demo User via API

If the login isn't working, you can create a demo user by accessing this URL in your browser:

```
http://localhost:5000/api/auth/create-demo-user
```

This will generate a demo user with the credentials:
- Email: demo@habitjoy.com
- Password: password123

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check the connection string in your `.env` file
   - Verify network connectivity to MongoDB

2. **Port Already in Use**:
   - If port 5000 is already in use, you can change it in the `.env` file
   - Kill any existing process using the port: `kill -9 $(lsof -ti:5000)`

3. **Authentication Issues**:
   - Check that JWT_SECRET is set in your `.env` file
   - Ensure CORS settings are correct for your frontend URL

### Frontend Issues

1. **API Connection Errors**:
   - Verify the backend URL in `/src/utils/api.ts` is correctly set to 'http://localhost:5000/api'
   - Ensure the backend server is running
   - Check for CORS issues in browser console

2. **Rendering Problems**:
   - Clear browser cache and reload
   - Check console for JavaScript errors
   - Verify the correct Node.js version

## Next Steps

After getting the application running, you can:

1. Explore the redesign documentation in `/docs/redesign/` to understand the future vision
2. Examine the codebase structure to familiarize yourself with its organization
3. Try logging moods and habits to see how the core functionality works

## Getting Help

If you're still having issues, try:

1. Checking the browser developer console for specific error messages
2. Looking at the terminal output from both frontend and backend servers
3. Creating a new issue if you've found a reproducible bug

---

Happy Tracking! 😊
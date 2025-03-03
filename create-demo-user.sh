#!/bin/bash
echo "Creating demo user through API..."
if command -v curl >/dev/null 2>&1; then
  RESPONSE=$(curl -s http://localhost:5000/api/auth/create-demo-user)
  echo "Response: $RESPONSE"
  echo "You can now log in with:"
  echo "Email: demo@habitjoy.com"
  echo "Password: password123"
else
  echo "curl not found. Please visit http://localhost:5000/api/auth/create-demo-user in your browser."
fi

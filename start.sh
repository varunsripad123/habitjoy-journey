#!/bin/bash
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BOLD}Starting HabitJoy...${NC}"

# Start backend
echo -e "${BLUE}Starting backend server...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}Backend started with PID ${BACKEND_PID}${NC}"
echo "Backend logs will be written to backend.log"

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend
echo -e "${BLUE}Starting frontend server...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}Frontend started with PID ${FRONTEND_PID}${NC}"
echo "Frontend logs will be written to frontend.log"

# Save PIDs for later cleanup
echo "${BACKEND_PID}" > .backend.pid
echo "${FRONTEND_PID}" > .frontend.pid

echo -e "\n${BOLD}HabitJoy is running!${NC}"
echo "- Backend: http://localhost:5000"
echo "- Frontend: Check frontend.log for the correct URL (usually http://localhost:8080)"
echo -e "\nUse ${BOLD}./stop.sh${NC} to stop the application"
echo -e "Use ${BOLD}./create-demo-user.sh${NC} to create a demo user if needed"

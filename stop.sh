#!/bin/bash
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BOLD}Stopping HabitJoy...${NC}"

# Stop backend
if [ -f .backend.pid ]; then
  BACKEND_PID=$(cat .backend.pid)
  if ps -p $BACKEND_PID > /dev/null; then
    kill $BACKEND_PID
    echo -e "${GREEN}Backend stopped (PID: $BACKEND_PID)${NC}"
  else
    echo -e "${RED}Backend process not found${NC}"
  fi
  rm .backend.pid
else
  echo "No backend PID file found"
fi

# Stop frontend
if [ -f .frontend.pid ]; then
  FRONTEND_PID=$(cat .frontend.pid)
  if ps -p $FRONTEND_PID > /dev/null; then
    kill $FRONTEND_PID
    echo -e "${GREEN}Frontend stopped (PID: $FRONTEND_PID)${NC}"
  else
    echo -e "${RED}Frontend process not found${NC}"
  fi
  rm .frontend.pid
else
  echo "No frontend PID file found"
fi

echo -e "\n${BOLD}HabitJoy has been stopped${NC}"

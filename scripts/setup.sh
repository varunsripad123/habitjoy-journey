#!/bin/bash

# HabitJoy Setup Script
# This script helps set up and run the HabitJoy application

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "\n${BOLD}${BLUE}$1${NC}\n"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Welcome message
clear
echo -e "${BOLD}Welcome to HabitJoy Setup Script${NC}"
echo -e "This script will help you set up and run the HabitJoy application.\n"

# Check prerequisites
print_header "Checking Prerequisites"

# Check Node.js
if command_exists node; then
  NODE_VERSION=$(node -v)
  echo -e "Node.js: ${GREEN}$NODE_VERSION${NC}"
else
  print_error "Node.js is not installed. Please install Node.js v16 or higher."
  exit 1
fi

# Check npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  echo -e "npm: ${GREEN}$NPM_VERSION${NC}"
else
  print_error "npm is not installed. Please install npm."
  exit 1
fi

# Check if MongoDB is installed or available via Docker
MONGODB_AVAILABLE=false

if command_exists mongod; then
  echo -e "MongoDB: ${GREEN}Installed${NC}"
  MONGODB_AVAILABLE=true
elif command_exists docker; then
  echo -e "Docker: ${GREEN}Installed${NC} (can be used for MongoDB)"
  MONGODB_AVAILABLE=true
else
  echo -e "MongoDB/Docker: ${RED}Not found${NC}"
  echo "You'll need either MongoDB installed locally or Docker to run MongoDB."
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Setup backend
print_header "Setting Up Backend"
echo "Navigating to backend directory..."
cd backend || { print_error "Backend directory not found!"; exit 1; }

echo "Installing backend dependencies..."
npm install || { print_error "Failed to install backend dependencies!"; exit 1; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env || { print_error "Failed to create .env file!"; exit 1; }
  
  # Generate a random JWT secret
  JWT_SECRET=$(openssl rand -base64 32)
  
  # Update .env file
  sed -i '' "s/JWT_SECRET=your_super_secret_key_change_in_production/JWT_SECRET=$JWT_SECRET/" .env
  sed -i '' "s/FRONTEND_URL=http:\/\/localhost:3000/FRONTEND_URL=http:\/\/localhost:8080/" .env
  
  print_success "Created and configured .env file"
else
  echo "Using existing .env file"
fi

# Setup MongoDB if Docker is available and MongoDB isn't running
if command_exists docker && ! (command_exists mongod && pgrep mongod >/dev/null); then
  echo "Checking if MongoDB container is running..."
  if ! docker ps | grep -q mongo; then
    echo "Starting MongoDB container..."
    docker run -d -p 27017:27017 --name mongodb mongo:latest || {
      print_error "Failed to start MongoDB container!"
      echo "Is Docker running? Do you have permission to run Docker containers?"
      exit 1
    }
    print_success "MongoDB container started"
  else
    print_success "MongoDB container is already running"
  fi
fi

# Setup frontend
print_header "Setting Up Frontend"
cd ..
echo "Installing frontend dependencies..."
npm install || { print_error "Failed to install frontend dependencies!"; exit 1; }

# Create demo user script
print_header "Creating Helper Scripts"

cat > create-demo-user.sh << 'EOL'
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
EOL

chmod +x create-demo-user.sh
print_success "Created demo user helper script"

# Create start script
cat > start.sh << 'EOL'
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
EOL

chmod +x start.sh
print_success "Created start script"

# Create stop script
cat > stop.sh << 'EOL'
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
EOL

chmod +x stop.sh
print_success "Created stop script"

# Final instructions
print_header "Setup Complete!"
echo -e "To start HabitJoy, run: ${BOLD}./start.sh${NC}"
echo -e "To stop HabitJoy, run: ${BOLD}./stop.sh${NC}"
echo -e "To create a demo user, run: ${BOLD}./create-demo-user.sh${NC}"
echo
echo -e "After starting the application, you can access it at:"
echo -e "- Frontend: ${BOLD}http://localhost:8080${NC} (or check frontend.log for the correct URL)"
echo -e "- Backend API: ${BOLD}http://localhost:5000/api${NC}"
echo
echo -e "Use these credentials to log in:"
echo -e "- Email: ${BOLD}demo@habitjoy.com${NC}"
echo -e "- Password: ${BOLD}password123${NC}"
echo
echo -e "For more information, see ${BOLD}docs/getting-started.md${NC}"
echo -e "To learn about the redesign plans, see ${BOLD}docs/redesign/${NC}"
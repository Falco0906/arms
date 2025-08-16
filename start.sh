#!/bin/bash

# ARMS Platform - Quick Start Script
# This script starts both backend and frontend services

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🚀 Starting ARMS Platform..."
echo "============================"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    print_warning "backend/.env not found. Run ./setup-local.sh first."
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    print_warning "frontend/.env not found. Run ./setup-local.sh first."
    exit 1
fi

# Start database if Docker is available
if command -v docker &> /dev/null; then
    print_status "Starting database services..."
    docker-compose up -d postgres redis minio
    print_success "Database services started!"
    echo ""
else
    print_warning "Docker not found. Make sure PostgreSQL is running manually."
    echo ""
fi

# Function to start backend
start_backend() {
    print_status "Starting backend server..."
    cd backend
    ./mvnw spring-boot:run
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend server..."
    cd frontend
    npm start
}

# Check if we should start both or just one
if [ "$1" = "backend" ]; then
    start_backend
elif [ "$1" = "frontend" ]; then
    start_frontend
else
    # Start both in parallel
    print_status "Starting both backend and frontend..."
    echo ""
    echo "Backend will be available at: http://localhost:8080"
    echo "Frontend will be available at: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop both services"
    echo ""
    
    # Start backend in background
    start_backend &
    BACKEND_PID=$!
    
    # Wait a moment for backend to start
    sleep 5
    
    # Start frontend
    start_frontend &
    FRONTEND_PID=$!
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
fi

#!/bin/bash

# ARMS Platform Setup Script
# This script helps you set up the ARMS platform development environment

set -e

echo "🚀 Welcome to ARMS Platform Setup!"
echo "=================================="
echo ""

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    # Check Java
    if ! command -v java &> /dev/null; then
        echo "❌ Java is not installed. Please install Java 17+ first."
        exit 1
    fi
    
    java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$java_version" -lt 17 ]; then
        echo "❌ Java 17+ is required. Current version: $java_version"
        exit 1
    fi
    echo "✅ Java $(java -version 2>&1 | head -n 1 | cut -d'"' -f2) found"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 16 ]; then
        echo "❌ Node.js 16+ is required. Current version: $node_version"
        exit 1
    fi
    echo "✅ Node.js $(node --version) found"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    echo "✅ npm $(npm --version) found"
    
    # Check Maven
    if ! command -v mvn &> /dev/null; then
        echo "❌ Maven is not installed. Please install Maven 3.6+ first."
        exit 1
    fi
    echo "✅ Maven $(mvn --version | head -n 1 | cut -d' ' -f3) found"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        echo "✅ Docker found"
    else
        echo "⚠️  Docker not found (optional for development)"
    fi
    
    echo ""
}

# Setup backend
setup_backend() {
    echo "🔧 Setting up Backend (Spring Boot)..."
    cd backend
    
    # Check if Maven wrapper exists
    if [ ! -f "./mvnw" ]; then
        echo "📥 Installing Maven wrapper..."
        mvn wrapper:wrapper
    fi
    
    echo "📦 Installing dependencies..."
    ./mvnw clean install -DskipTests
    
    echo "✅ Backend setup complete!"
    cd ..
    echo ""
}

# Setup frontend
setup_frontend() {
    echo "🔧 Setting up Frontend (React)..."
    cd frontend
    
    echo "📦 Installing dependencies..."
    npm install
    
    echo "✅ Frontend setup complete!"
    cd ..
    echo ""
}

# Setup database
setup_database() {
    echo "🗄️  Setting up Database..."
    
    if command -v docker &> /dev/null; then
        echo "🐳 Starting PostgreSQL with Docker..."
        docker-compose up -d postgres
        
        echo "⏳ Waiting for database to be ready..."
        sleep 10
        
        echo "📊 Initializing database..."
        ./init-db.sh
        
        echo "✅ Database setup complete!"
    else
        echo "⚠️  Docker not available. Please set up PostgreSQL manually:"
        echo "   1. Install PostgreSQL 13+"
        echo "   2. Create database: oops_platform"
        echo "   3. Update backend/src/main/resources/application.properties"
        echo "   4. Run init-db.sh manually"
    fi
    
    echo ""
}

# Create environment files
create_env_files() {
    echo "📝 Creating environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arms_platform
DB_USERNAME=arms_user
DB_PASSWORD=arms_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=86400000

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads

# Server Configuration
SERVER_PORT=8080
EOF
        echo "✅ Created backend/.env"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws

# Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_FILE_UPLOAD=true
REACT_APP_MAX_FILE_SIZE=52428800
EOF
        echo "✅ Created frontend/.env"
    fi
    
    echo ""
}

# Display next steps
show_next_steps() {
    echo "🎉 Setup Complete! Here's what to do next:"
    echo ""
    echo "1. 🗄️  Database:"
    if command -v docker &> /dev/null; then
        echo "   - Database is running at localhost:5432"
        echo "   - Username: oops_user, Password: oops_password"
    else
        echo "   - Set up PostgreSQL manually and update backend/.env"
    fi
    echo ""
    echo "2. 🔧 Backend:"
    echo "   - cd backend"
    echo "   - ./mvnw spring-boot:run"
    echo "   - Server will start at http://localhost:8080"
    echo ""
    echo "3. 🌐 Frontend:"
    echo "   - cd frontend"
    echo "   - npm start"
    echo "   - App will open at http://localhost:3000"
    echo ""
    echo "4. 📚 API Documentation:"
    echo "   - Backend API docs: http://localhost:8080/swagger-ui.html"
    echo ""
    echo "5. 🧪 Testing:"
    echo "   - Backend tests: cd backend && ./mvnw test"
    echo "   - Frontend tests: cd frontend && npm test"
    echo ""
    echo "🚀 Happy coding!"
}

# Main setup flow
main() {
    check_requirements
    setup_backend
    setup_frontend
    setup_database
    create_env_files
    show_next_steps
}

# Run setup
main "$@"
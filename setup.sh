#!/bin/bash
echo "🚀 Setting up OOPS Platform..."

# Check if we're in the right directory
if [ ! -f "pom.xml" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the arms-platform root directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Backend setup
echo "☕ Setting up Spring Boot backend..."
cd backend

# Create Maven wrapper if it doesn't exist
if [ ! -f "mvnw" ]; then
    echo "📦 Installing Maven wrapper..."
    mvn wrapper:wrapper
fi

# Make mvnw executable
chmod +x mvnw

# Frontend setup
echo "⚛ Setting up React frontend..."
cd ../frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    echo "Please ensure you're running this from the correct project root"
    exit 1
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install Tailwind CSS if not already installed
if [ ! -f "tailwind.config.js" ]; then
    echo "🎨 Installing Tailwind CSS..."
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Install PostgreSQL or run: docker-compose up postgres"
echo "2. Create database: createdb oops_platform"
echo "3. Start backend: cd backend && ./mvnw spring-boot:run"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
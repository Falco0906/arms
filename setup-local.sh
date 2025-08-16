#!/bin/bash

# ARMS Platform - Local Development Setup Script
# This script sets up the complete local development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 ARMS Platform - Local Development Setup"
echo "=========================================="
echo ""

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 17+ first."
        exit 1
    fi
    
    java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$java_version" -lt 17 ]; then
        print_error "Java 17+ is required. Current version: $java_version"
        exit 1
    fi
    print_success "Java $(java -version 2>&1 | head -n 1 | cut -d'"' -f2) found"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 16 ]; then
        print_error "Node.js 16+ is required. Current version: $node_version"
        exit 1
    fi
    print_success "Node.js $(node --version) found"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_success "npm $(npm --version) found"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker found"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found (optional for development)"
        DOCKER_AVAILABLE=false
    fi
    
    echo ""
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/env.example" ]; then
            cp backend/env.example backend/.env
            print_success "Created backend/.env from template"
        else
            print_error "backend/env.example not found"
            exit 1
        fi
    else
        print_warning "backend/.env already exists, skipping..."
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/env.example" ]; then
            cp frontend/env.example frontend/.env
            print_success "Created frontend/.env from template"
        else
            print_error "frontend/env.example not found"
            exit 1
        fi
    else
        print_warning "frontend/.env already exists, skipping..."
    fi
    
    echo ""
}

# Setup backend
setup_backend() {
    print_status "Setting up Backend (Spring Boot)..."
    cd backend
    
    # Check if Maven wrapper exists
    if [ ! -f "./mvnw" ]; then
        print_status "Installing Maven wrapper..."
        mvn wrapper:wrapper
    fi
    
    print_status "Installing dependencies..."
    ./mvnw clean install -DskipTests
    
    print_success "Backend setup complete!"
    cd ..
    echo ""
}

# Setup frontend
setup_frontend() {
    print_status "Setting up Frontend (React)..."
    cd frontend
    
    print_status "Installing dependencies..."
    npm install
    
    print_success "Frontend setup complete!"
    cd ..
    echo ""
}

# Setup database
setup_database() {
    print_status "Setting up Database..."
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Starting PostgreSQL with Docker..."
        docker-compose up -d postgres
        
        print_status "Waiting for database to be ready..."
        sleep 10
        
        print_status "Initializing database..."
        if [ -f "init-db.sh" ]; then
            ./init-db.sh
        else
            print_warning "init-db.sh not found, database initialization skipped"
        fi
        
        print_success "Database setup complete!"
    else
        print_warning "Docker not available. Please set up PostgreSQL manually:"
        echo "   1. Install PostgreSQL 13+"
        echo "   2. Create database: arms_platform"
        echo "   3. Update backend/.env with your database credentials"
        echo "   4. Run init-db.sh manually if available"
    fi
    
    echo ""
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Backend directories
    mkdir -p backend/uploads
    mkdir -p backend/logs
    
    # Frontend directories
    mkdir -p frontend/public/uploads
    
    print_success "Directories created!"
    echo ""
}

# Update application.properties to use environment variables
update_application_properties() {
    print_status "Updating application.properties to use environment variables..."
    
    # Create a backup of the original file
    if [ -f "backend/src/main/resources/application.properties" ]; then
        cp backend/src/main/resources/application.properties backend/src/main/resources/application.properties.backup
        print_success "Backup created: application.properties.backup"
    fi
    
    # Create new application.properties with environment variable placeholders
    cat > backend/src/main/resources/application.properties << 'EOF'
# Database Configuration
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/arms_platform}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres_password}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=${JPA_DDL_AUTO:update}
spring.jpa.show-sql=${JPA_SHOW_SQL:true}
spring.jpa.properties.hibernate.dialect=${JPA_HIBERNATE_DIALECT:org.hibernate.dialect.PostgreSQLDialect}

# JWT Configuration
app.jwt.secret=${JWT_SECRET:mySecretKey123456789}
app.jwt.expiration=${JWT_EXPIRATION:86400000}
app.jwt.issuer=${JWT_ISSUER:arms-platform}
app.jwt.audience=${JWT_AUDIENCE:arms-platform-users}

# File Upload Configuration
spring.servlet.multipart.max-file-size=${MAX_FILE_SIZE:50MB}
spring.servlet.multipart.max-request-size=${MAX_REQUEST_SIZE:50MB}
app.upload.dir=${UPLOAD_DIR:uploads}
app.upload.allowed-types=${ALLOWED_FILE_TYPES:pdf,doc,docx,ppt,pptx,txt,jpg,jpeg,png,gif,zip,rar,mp4,avi,mov}

# AWS S3 Configuration (Optional)
aws.s3.bucket.name=${AWS_S3_BUCKET_NAME:arms-platform-files}
aws.s3.region=${AWS_S3_REGION:us-east-1}
aws.s3.access-key=${AWS_S3_ACCESS_KEY:}
aws.s3.secret-key=${AWS_S3_SECRET_KEY:}
aws.s3.endpoint=${AWS_S3_ENDPOINT:https://s3.amazonaws.com}

# MinIO Configuration (for local file storage)
minio.endpoint=${MINIO_ENDPOINT:http://localhost:9000}
minio.access-key=${MINIO_ACCESS_KEY:minioadmin}
minio.secret-key=${MINIO_SECRET_KEY:minioadmin123}
minio.bucket.name=${MINIO_BUCKET_NAME:arms-platform-files}

# Server Configuration
server.port=${SERVER_PORT:8080}
server.servlet.context-path=${SERVER_CONTEXT_PATH:/api}

# CORS Configuration
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}

# Redis Configuration (for caching and sessions)
spring.redis.host=${REDIS_HOST:localhost}
spring.redis.port=${REDIS_PORT:6379}
spring.redis.password=${REDIS_PASSWORD:}
spring.redis.database=${REDIS_DATABASE:0}

# Email Configuration (for notifications)
spring.mail.host=${SMTP_HOST:smtp.gmail.com}
spring.mail.port=${SMTP_PORT:587}
spring.mail.username=${SMTP_USERNAME:}
spring.mail.password=${SMTP_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.from=${SMTP_FROM:noreply@arms-platform.com}

# Logging Configuration
logging.level.root=${LOG_LEVEL:INFO}
logging.file.name=${LOG_FILE:logs/arms-platform.log}
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n

# Security Configuration
app.security.bcrypt.rounds=${BCRYPT_ROUNDS:12}
app.security.password.min-length=${PASSWORD_MIN_LENGTH:8}
app.security.password.require-uppercase=${PASSWORD_REQUIRE_UPPERCASE:true}
app.security.password.require-lowercase=${PASSWORD_REQUIRE_LOWERCASE:true}
app.security.password.require-digits=${PASSWORD_REQUIRE_DIGITS:true}
app.security.password.require-special-chars=${PASSWORD_REQUIRE_SPECIAL_CHARS:true}

# Application Configuration
app.name=${APP_NAME:ARMS Platform}
app.version=${APP_VERSION:1.0.0}
app.environment=${APP_ENVIRONMENT:development}
app.debug=${APP_DEBUG:true}

# Rate Limiting
app.rate-limit.requests-per-minute=${RATE_LIMIT_REQUESTS_PER_MINUTE:100}
app.rate-limit.burst-size=${RATE_LIMIT_BURST_SIZE:20}

# Health Check Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=${HEALTH_CHECK_ENABLED:true}
management.health.defaults.enabled=true
EOF

    print_success "application.properties updated to use environment variables!"
    echo ""
}

# Display next steps
show_next_steps() {
    echo "🎉 Setup Complete! Here's what to do next:"
    echo ""
    echo "1. 📝 Environment Configuration:"
    echo "   - Review and customize backend/.env"
    echo "   - Review and customize frontend/.env"
    echo ""
    echo "2. 🗄️  Database:"
    if [ "$DOCKER_AVAILABLE" = true ]; then
        echo "   - Database is running at localhost:5432"
        echo "   - Username: postgres, Password: postgres_password"
        echo "   - Database: arms_platform"
    else
        echo "   - Set up PostgreSQL manually and update backend/.env"
    fi
    echo ""
    echo "3. 🔧 Backend:"
    echo "   - cd backend"
    echo "   - ./mvnw spring-boot:run"
    echo "   - Server will start at http://localhost:8080"
    echo ""
    echo "4. 🌐 Frontend:"
    echo "   - cd frontend"
    echo "   - npm start"
    echo "   - App will open at http://localhost:3000"
    echo ""
    echo "5. 📚 API Documentation:"
    echo "   - Backend API docs: http://localhost:8080/swagger-ui.html"
    echo ""
    echo "6. 🧪 Testing:"
    echo "   - Backend tests: cd backend && ./mvnw test"
    echo "   - Frontend tests: cd frontend && npm test"
    echo ""
    echo "7. 🐳 Docker Services (optional):"
    echo "   - Redis: localhost:6379"
    echo "   - MinIO: localhost:9000 (Console: localhost:9001)"
    echo "   - Adminer: localhost:8081"
    echo ""
    echo "🚀 Happy coding!"
}

# Main setup flow
main() {
    check_prerequisites
    create_env_files
    setup_backend
    setup_frontend
    setup_database
    create_directories
    update_application_properties
    show_next_steps
}

# Run setup
main "$@"

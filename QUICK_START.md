# 🚀 ARMS Platform - Quick Start Guide

Get the ARMS Platform running locally in minutes!

## 📋 Prerequisites

- **Java 17+** - [Download here](https://adoptium.net/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Docker** (optional) - [Download here](https://www.docker.com/products/docker-desktop/)

## ⚡ Quick Setup

### 1. Clone and Setup
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd arms-platform

# Run the automated setup script
./setup-local.sh
```

### 2. Start the Application

#### Option A: Using Docker (Recommended)
```bash
# Start all services (PostgreSQL, Redis, MinIO)
docker-compose up -d

# Start backend
cd backend && ./mvnw spring-boot:run

# In another terminal, start frontend
cd frontend && npm start
```

#### Option B: Manual Setup
```bash
# Start backend
cd backend && ./mvnw spring-boot:run

# In another terminal, start frontend
cd frontend && npm start
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Database Admin**: http://localhost:8081 (if using Docker)

## 🔧 Environment Configuration

The setup script creates `.env` files for both backend and frontend. You can customize these for your environment:

### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arms_platform
DB_USERNAME=postgres
DB_PASSWORD=postgres_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=86400000

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
```

### Frontend (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws

# Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_FILE_UPLOAD=true
```

## 🧪 Sample Data

The platform comes with sample data for testing:

### Users
- **Admin**: admin@university.edu / password123
- **Faculty**: prof.johnson@university.edu / password123
- **Student**: sarah.chen@university.edu / password123

### Courses
- CS101: Data Structures
- CS201: Operating Systems
- CS301: Database Systems
- MATH101: Linear Algebra

## 🐳 Docker Services

If using Docker, these services are available:

| Service | URL | Purpose |
|---------|-----|---------|
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Caching |
| MinIO | localhost:9000 | File Storage |
| MinIO Console | localhost:9001 | File Management |
| Adminer | localhost:8081 | Database Admin |

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :8080
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 2. Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### 3. Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Backend Build Issues
```bash
# Clean Maven cache
./mvnw clean

# Reinstall dependencies
./mvnw dependency:resolve
```

### Logs

#### Backend Logs
```bash
# View application logs
tail -f backend/logs/arms-platform.log

# View Spring Boot logs
tail -f backend/spring.log
```

#### Frontend Logs
```bash
# View React development server logs
# (shown in the terminal where npm start is running)
```

#### Docker Logs
```bash
# View all container logs
docker-compose logs

# View specific service logs
docker-compose logs postgres
docker-compose logs redis
```

## 🚀 Development Workflow

### 1. Making Changes
```bash
# Backend changes are auto-reloaded
# Frontend changes are auto-reloaded
```

### 2. Running Tests
```bash
# Backend tests
cd backend && ./mvnw test

# Frontend tests
cd frontend && npm test
```

### 3. Building for Production
```bash
# Backend
cd backend && ./mvnw clean package

# Frontend
cd frontend && npm run build
```

## 📚 Next Steps

1. **Explore the API**: Visit http://localhost:8080/swagger-ui.html
2. **Check the Database**: Use Adminer at http://localhost:8081
3. **Upload Files**: Test the file upload functionality
4. **Create Users**: Register new accounts and test roles
5. **Add Courses**: Create new courses and materials

## 🆘 Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review the [PLATFORM_OVERVIEW.md](PLATFORM_OVERVIEW.md) for feature details
- Create an issue in the repository for bugs or feature requests

---

**Happy coding! 🎉**

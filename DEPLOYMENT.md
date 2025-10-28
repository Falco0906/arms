# ARMS Platform Deployment Guide

## 🎉 Current Status

✅ **Frontend**: Running on http://localhost:3000  
✅ **Backend**: Running on http://localhost:8080  
✅ **Database**: Firebase Firestore  
✅ **Authentication**: Firebase Auth  
✅ **Storage**: Firebase Storage

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │────────▶│  Spring Boot API │────────▶│  Firebase       │
│  (Port 3000)    │         │  (Port 8080)     │         │  (Cloud)        │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: React 18
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Firebase SDK**: Firebase JS SDK 10.x

### Backend
- **Framework**: Spring Boot 3.1.0
- **Language**: Java 17
- **Build Tool**: Maven
- **Firebase**: Firebase Admin SDK 9.2.0
- **Security**: Spring Security

### Database & Services
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Hosting**: Firebase Hosting (recommended)

## Running Locally

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.8+
- Firebase project (optional for basic testing)

### Start Frontend
```bash
cd frontend
npm install
npm start
# Opens on http://localhost:3000
```

### Start Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### API Endpoints

#### Health Check
```bash
curl http://localhost:8080/api/health
```

#### API Info
```bash
curl http://localhost:8080/api/info
```

#### Verify Firebase Token
```bash
curl -X POST http://localhost:8080/api/verify-token \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-firebase-token"}'
```

## Docker Deployment

### Build and Run with Docker Compose
```bash
# Make sure Docker Desktop is running
docker-compose up --build

# Access:
# Frontend: http://localhost:80
# Backend: http://localhost:8080
```

### Individual Docker Builds

#### Backend
```bash
cd backend
docker build -t arms-backend .
docker run -p 8080:8080 arms-backend
```

#### Frontend
```bash
cd frontend
docker build -t arms-frontend .
docker run -p 80:80 arms-frontend
```

## Firebase Configuration

### For Frontend
Create `frontend/.env`:
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### For Backend (Optional)
The backend works without Firebase credentials but can integrate if needed:

1. Download Firebase service account key from Firebase Console
2. Save as `backend/firebase-credentials.json`
3. Update `backend/src/main/resources/application.properties`:
```properties
firebase.credentials.path=firebase-credentials.json
firebase.project.id=your-project-id
firebase.storage.bucket=your-project.appspot.com
```

## Production Deployment

### Option 1: Frontend Only (Recommended)
Deploy just the React frontend to:
- **Firebase Hosting** (recommended)
- Netlify
- Vercel

```bash
cd frontend
npm run build
firebase deploy
```

### Option 2: Full Stack Deployment

#### Frontend → Firebase Hosting
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

#### Backend → Cloud Run / App Engine / Heroku
```bash
cd backend
mvn clean package
# Deploy JAR to your cloud provider
```

### Option 3: Docker Deployment
Deploy the entire stack using docker-compose to:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

## Features

### Implemented
✅ User Authentication (Firebase Auth)  
✅ Course Management  
✅ Material Upload & Download  
✅ User Rankings  
✅ News Feed  
✅ Dark Mode  
✅ Real-time Chat  
✅ Comments & Likes  
✅ Search Functionality  
✅ Notifications  
✅ User Profiles  

### Backend API (Java/Spring Boot)
✅ RESTful API endpoints  
✅ CORS configuration  
✅ Security configuration  
✅ Firebase integration ready  
✅ Health check endpoints  
✅ Token verification  

## Project Structure

```
arms-platform/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── firebase/
│   │   ├── App.js
│   │   └── firebase.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/
│   ├── src/main/java/com/arms/platform/
│   │   ├── api/
│   │   │   └── ApiController.java
│   │   ├── config/
│   │   │   ├── FirebaseConfig.java
│   │   │   └── SecurityConfig.java
│   │   ├── service/
│   │   │   └── FirebaseUserService.java
│   │   └── ArmsPlatformApplication.java
│   ├── Dockerfile
│   └── pom.xml
├── docker-compose.yml
└── DEPLOYMENT.md
```

## Troubleshooting

### Frontend Issues
- **White screen**: Check browser console for errors
- **Firebase errors**: Verify `.env` file has correct credentials
- **Build errors**: Run `npm install` and clear cache with `npm cache clean --force`

### Backend Issues
- **Port 8080 in use**: Kill process with `lsof -ti:8080 | xargs kill -9`
- **Build fails**: Ensure Java 17+ and Maven 3.8+ are installed
- **Firebase errors**: Backend works without Firebase, errors are warnings only

### Docker Issues
- **Docker not running**: Start Docker Desktop
- **Port conflicts**: Change ports in `docker-compose.yml`
- **Build fails**: Run `docker-compose down` and try again

## Support

For issues or questions:
1. Check the console logs
2. Verify all environment variables are set
3. Ensure Firebase project is configured correctly
4. Check that all services are running

## License

Academic project for educational purposes.

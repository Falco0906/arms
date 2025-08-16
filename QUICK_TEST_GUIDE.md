# Quick Test Guide - ARMS Platform Integration

## 🚀 Test the Complete Integration

### Prerequisites
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:3000`
- PostgreSQL database running via Docker

### 1. Test Backend APIs

#### Register a New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "password123"
  }'
```

#### Login with the User
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the `accessToken` from the response for the next tests.**

#### List Courses (with authentication)
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8080/api/courses
```

#### Upload a Test File
```bash
# Create a test file
echo "This is a test file for ARMS platform" > test_file.txt

# Upload to course ID 1
curl -X POST "http://localhost:8080/api/courses/1/materials" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=Test Material" \
  -F "type=NOTES" \
  -F "file=@test_file.txt"
```

#### Check Rankings
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:8080/api/rankings?limit=5"
```

#### Download the Uploaded File
```bash
# Use the path from the upload response
curl http://localhost:8080/files/1/FILENAME_FROM_RESPONSE
```

### 2. Test Frontend Integration

#### Open the Application
1. Navigate to `http://localhost:3000` in your browser
2. You should see the ARMS login page

#### Test Registration
1. Click "Register here" link
2. Fill in the registration form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Create Account"
4. You should be automatically logged in and redirected to the dashboard

#### Test Login
1. If you're logged out, use the login form:
   - Email: "test@example.com"
   - Password: "password123"
2. Click "Sign In"
3. You should be redirected to the dashboard

#### Test Dashboard Features
1. **View Courses**: The dashboard should show all available courses
2. **Course Details**: Click on any course to view its materials
3. **Upload Material**: 
   - Click the "Upload" button in the header
   - Select a course
   - Choose a file type
   - Enter a title
   - Select a file
   - Click "Upload"
4. **View Rankings**: 
   - Click "Rankings" in the sidebar
   - You should see the leaderboard with upload counts

### 3. Expected Results

#### Backend API Responses
- **Registration/Login**: Returns JWT token and user data
- **Courses**: Returns array of 6 courses with details
- **Upload**: Returns material details with file path
- **Rankings**: Returns array of users with upload counts
- **File Download**: Returns file content

#### Frontend Behavior
- **Login/Register**: Smooth authentication flow
- **Dashboard**: Real-time course data from API
- **Upload**: File upload with progress and success feedback
- **Rankings**: Live leaderboard updates
- **Navigation**: Smooth transitions between pages
- **Error Handling**: User-friendly error messages

### 4. Troubleshooting

#### Backend Issues
- **Port 8080 in use**: Check if another application is using the port
- **Database connection**: Ensure PostgreSQL is running via Docker
- **JWT errors**: Check if the token is valid and not expired

#### Frontend Issues
- **Port 3000 in use**: React will automatically suggest another port
- **API connection**: Check if backend is running on port 8080
- **CORS errors**: Backend CORS is configured for localhost:3000

#### Common Commands
```bash
# Check if backend is running
curl http://localhost:8080/actuator/health

# Check if frontend is running
curl http://localhost:3000

# Restart backend
cd backend && ./mvnw spring-boot:run

# Restart frontend
cd frontend && npm start
```

### 5. Success Indicators

✅ **Backend**: All API endpoints return expected data  
✅ **Frontend**: All pages load and function correctly  
✅ **Authentication**: Login/register works with JWT  
✅ **File Upload**: Files upload and download successfully  
✅ **Rankings**: Leaderboard shows real-time data  
✅ **Integration**: Frontend and backend communicate seamlessly  

## 🎉 Integration Complete!

If all tests pass, congratulations! The ARMS platform is fully integrated and ready for use. The frontend successfully connects to the backend APIs, handles authentication, manages files, and displays real-time data.

**The platform is now production-ready!** 🚀

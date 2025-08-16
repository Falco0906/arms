# ARMS Platform - Academic Resource Management System

A comprehensive university platform for sharing and accessing course materials, built with a modern tech stack and Notion-like interface.

## 🚀 Features

### Core Functionality
- **Authentication System**: Login/Register with role-based access (Student, Faculty, Admin)
- **Homepage**: University news and announcements uploaded by faculty and higher students
- **Course Dashboard**: Personalized view of enrolled courses with notification badges
- **Course Filtering**: Advanced course selection with search and checkbox filtering
- **Material Management**: Upload, search, and filter course materials by type
- **User Rankings**: Leaderboard based on upload contributions with detailed profiles
- **User Profiles**: Individual user pages showing contributions and course statistics
- **Real-time Notifications**: Badge notifications for new course materials

### Material Types Supported
- 📚 Lecture Notes
- 📝 Assignments
- 💻 Code/Lab Files
- 🎯 Presentations
- 📄 Documents

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + TailwindCSS (Notion-like UI) |
| **Backend** | Java Spring Boot (REST API) |
| **Database** | PostgreSQL |
| **File Storage** | AWS S3 (planned) |
| **Notifications** | Email (current) / Firebase Cloud Messaging (planned) |
| **Deployment** | Vercel (frontend) / Render/Railway (backend) |
| **Authentication** | Spring Security + JWT |

## 📁 Project Structure

```
arms-platform/
├── backend/             # Spring Boot Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/oops/platform/
│   │   │   │   ├── config/           # Configuration classes
│   │   │   │   ├── controller/       # REST API controllers
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── entity/           # JPA entities
│   │   │   │   ├── repository/       # Data access layer
│   │   │   │   ├── service/          # Business logic
│   │   │   │   └── util/             # Utility classes
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                     # Test files
│   ├── pom.xml                       # Maven dependencies
│   └── mvnw                          # Maven wrapper
├── frontend/            # React Application
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── auth/                 # Authentication components
│   │   │   ├── common/               # Shared components
│   │   │   ├── dashboard/            # Course dashboard
│   │   │   ├── home/                 # Homepage components
│   │   │   ├── rankings/             # User rankings
│   │   │   └── upload/               # Upload functionality
│   │   ├── services/                 # API services
│   │   ├── utils/                    # Utility functions
│   │   ├── App.js                    # Main application
│   │   └── index.js                  # Entry point
│   ├── package.json                  # Node dependencies
│   └── tailwind.config.js            # Tailwind configuration
├── docker-compose.yml                 # Docker setup
├── init-db.sh                        # Database initialization
├── setup.sh                          # Project setup script
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL 13+
- Maven 3.6+

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Configure database**:
   - Update `src/main/resources/application.properties` with your PostgreSQL credentials
   - Create a PostgreSQL database named `oops_platform`

3. **Run the application**:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   The frontend will start on `http://localhost:3000`

### Quick Start with Docker

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Initialize database**:
   ```bash
   ./init-db.sh
   ```

## 🔧 Configuration

### Backend Configuration
- Database connection settings in `application.properties`
- JWT secret configuration
- File upload size limits
- CORS settings

### Frontend Configuration
- API endpoint configuration in `src/services/api.js`
- Tailwind CSS customization in `tailwind.config.js`
- Environment variables for different deployment stages

## 📱 Key Components

### Authentication System
- JWT-based authentication
- Role-based access control
- Secure password handling
- Session management

### Course Management
- Course enrollment system
- Material categorization
- Search and filtering
- Notification system

### User Profiles
- Contribution tracking
- Course-specific statistics
- Upload history
- Ranking system

### Material Upload
- File type validation
- Size limit enforcement
- Metadata management
- Course association

## 🎨 UI/UX Features

- **Notion-like Interface**: Clean, modern design with smooth interactions
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized rendering and lazy loading

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Secure file upload handling
- SQL injection prevention

## 📊 Database Schema

### Core Entities
- **Users**: User accounts with roles and statistics
- **Courses**: Course information and metadata
- **Materials**: Uploaded files with metadata
- **UserCourses**: Many-to-many relationship between users and courses
- **News**: University announcements and news

### Key Relationships
- Users can enroll in multiple courses
- Materials belong to specific courses and users
- News items are authored by faculty/admin users
- User contributions are tracked across courses

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push

### Backend (Render/Railway)
1. Connect repository to platform
2. Configure Java build settings
3. Set environment variables
4. Configure database connections

## 🧪 Testing

### Backend Testing
- Unit tests with JUnit 5
- Integration tests with TestContainers
- API testing with MockMvc
- Database testing with H2

### Frontend Testing
- Component testing with React Testing Library
- Unit tests with Jest
- E2E testing with Cypress (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Real-time Chat**: Course-specific discussion forums
- **Mobile App**: Native iOS/Android applications
- **Advanced Analytics**: Learning analytics and insights
- **AI Integration**: Smart content recommendations
- **Video Streaming**: Integrated video content support
- **Collaborative Features**: Group projects and shared workspaces

---

**Built with ❤️ for the academic community**

#!/bin/bash

# ARMS Platform Demo Script
# This script demonstrates the key features of the platform

set -e

echo "🎓 ARMS Platform Demo"
echo "======================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "info")
            echo -e "${BLUE}ℹ️  ${message}${NC}"
            ;;
        "success")
            echo -e "${GREEN}✅ ${message}${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  ${message}${NC}"
            ;;
        "error")
            echo -e "${RED}❌ ${message}${NC}"
            ;;
        "step")
            echo -e "${PURPLE}🔹 ${message}${NC}"
            ;;
        "header")
            echo -e "${CYAN}${message}${NC}"
            ;;
    esac
}

# Check if services are running
check_services() {
    print_status "header" "Checking Service Status"
    echo "=================================="
    
    # Check backend
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        print_status "success" "Backend (Spring Boot) is running on http://localhost:8080"
    else
        print_status "error" "Backend is not running. Start it with: cd backend && ./mvnw spring-boot:run"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_status "success" "Frontend (React) is running on http://localhost:3000"
    else
        print_status "error" "Frontend is not running. Start it with: cd frontend && npm start"
    fi
    
    # Check database
    if docker ps | grep -q arms_postgres; then
        print_status "success" "PostgreSQL database is running"
    else
        print_status "warning" "PostgreSQL is not running. Start it with: docker-compose up -d postgres"
    fi
    
    echo ""
}

# Show platform features
show_features() {
    print_status "header" "Platform Features Overview"
    echo "====================================="
    echo ""
    
    print_status "step" "🔐 Authentication System"
    echo "   • Login/Register with role-based access"
    echo "   • JWT token-based authentication"
    echo "   • Student, Faculty, and Admin roles"
    echo ""
    
    print_status "step" "🏠 Homepage & News"
    echo "   • University news and announcements"
    echo "   • Faculty and admin content management"
    echo "   • Recent uploads showcase"
    echo ""
    
    print_status "step" "📚 Course Dashboard"
    echo "   • Personalized course view"
    echo "   • Course filtering and selection"
    echo "   • Notification badges for new content"
    echo "   • Course-specific material browsing"
    echo ""
    
    print_status "step" "🔍 Material Management"
    echo "   • Upload various content types (notes, assignments, code, etc.)"
    echo "   • Search and filter by content type"
    echo "   • File download and preview"
    echo "   • Course association and organization"
    echo ""
    
    print_status "step" "🏆 User Rankings & Profiles"
    echo "   • Leaderboard based on upload contributions"
    echo "   • Individual user profiles with statistics"
    echo "   • Course-specific contribution tracking"
    echo "   • Faculty and student rankings"
    echo ""
    
    print_status "step" "📤 Upload System"
    echo "   • Multi-file upload support"
    echo "   • Content type categorization"
    echo "   • Course and material association"
    echo "   • Progress tracking and validation"
    echo ""
    
    print_status "step" "🔔 Notifications"
    echo "   • Real-time notification badges"
    echo "   • Course-specific alerts"
    echo "   • New material notifications"
    echo "   • Email integration (planned)"
    echo ""
}

# Show sample data
show_sample_data() {
    print_status "header" "Sample Data Available"
    echo "============================="
    echo ""
    
    print_status "step" "👥 Sample Users"
    echo "   • Admin: admin@university.edu"
    echo "   • Faculty: prof.johnson@university.edu, prof.smith@university.edu"
    echo "   • Students: sarah.chen@university.edu, alex.kumar@university.edu, emily.rodriguez@university.edu"
    echo ""
    
    print_status "step" "📚 Sample Courses"
    echo "   • CS101: Data Structures"
    echo "   • CS201: Operating Systems"
    echo "   • CS301: Database Systems"
    echo "   • MATH101: Linear Algebra"
    echo "   • CS401: Machine Learning"
    echo "   • CS501: Software Engineering"
    echo ""
    
    print_status "step" "📄 Sample Materials"
    echo "   • Lecture notes and slides"
    echo "   • Assignment files"
    echo "   • Code examples and labs"
    echo "   • Project documents"
    echo ""
    
    print_status "step" "📰 Sample News"
    echo "   • Course announcements"
    echo "   • University updates"
    echo "   • Faculty notifications"
    echo ""
}

# Show API endpoints
show_api_endpoints() {
    print_status "header" "Available API Endpoints"
    echo "==============================="
    echo ""
    
    print_status "step" "🔐 Authentication"
    echo "   POST /api/auth/login - User login"
    echo "   POST /api/auth/register - User registration"
    echo "   POST /api/auth/logout - User logout"
    echo "   GET  /api/auth/me - Get current user"
    echo ""
    
    print_status "step" "👥 Users"
    echo "   GET  /api/users/rankings - Get top contributors"
    echo "   GET  /api/users/{id} - Get user by ID"
    echo "   GET  /api/users/profile/{email} - Get user by email"
    echo ""
    
    print_status "step" "📚 Courses"
    echo "   GET  /api/courses - Get all courses"
    echo "   GET  /api/courses/search?q={query} - Search courses"
    echo "   GET  /api/courses/{id} - Get course by ID"
    echo "   GET  /api/courses/user/{userId} - Get user's courses"
    echo ""
    
    print_status "step" "📄 Materials"
    echo "   GET  /api/materials - Get all materials"
    echo "   POST /api/materials/upload - Upload material"
    echo "   GET  /api/materials/search?q={query} - Search materials"
    echo "   GET  /api/materials/course/{courseId} - Get course materials"
    echo ""
    
    print_status "step" "📰 News"
    echo "   GET  /api/news - Get all news"
    echo "   GET  /api/news/type/{type} - Get news by type"
    echo "   POST /api/news - Create news (admin/faculty only)"
    echo ""
}

# Show usage instructions
show_usage() {
    print_status "header" "How to Use the Platform"
    echo "==============================="
    echo ""
    
    print_status "step" "1. 🚀 Getting Started"
    echo "   • Run: ./setup.sh (first time only)"
    echo "   • Start backend: cd backend && ./mvnw spring-boot:run"
    echo "   • Start frontend: cd frontend && npm start"
    echo "   • Open browser: http://localhost:3000"
    echo ""
    
    print_status "step" "2. 🔐 First Login"
    echo "   • Use any sample user credentials"
    echo "   • Or register a new account"
    echo "   • Explore different user roles"
    echo ""
    
    print_status "step" "3. 📚 Course Management"
    echo "   • Browse available courses"
    echo "   • Use course filter to select courses"
    echo "   • Click on courses to view details"
    echo "   • Access course materials and uploads"
    echo ""
    
    print_status "step" "4. 📤 Content Upload"
    echo "   • Click Upload button in header"
    echo "   • Select course and content type"
    echo "   • Add title and description"
    echo "   • Attach files and submit"
    echo ""
    
    print_status "step" "5. 🔍 Content Discovery"
    echo "   • Use search bar for global search"
    echo "   • Filter materials by type in course pages"
    echo "   • Browse recent uploads on homepage"
    echo "   • Check user profiles for contributions"
    echo ""
    
    print_status "step" "6. 🏆 Rankings & Profiles"
    echo "   • View top contributors in Rankings tab"
    echo "   • Click on user names to see profiles"
    echo "   • Explore user contributions by course"
    echo "   • Check upload statistics and history"
    echo ""
}

# Show development features
show_development() {
    print_status "header" "Development Features"
    echo "========================="
    echo ""
    
    print_status "step" "🛠️  Backend Development"
    echo "   • Spring Boot with JPA/Hibernate"
    echo "   • PostgreSQL database with sample data"
    echo "   • RESTful API with proper error handling"
    echo "   • JWT authentication and authorization"
    echo "   • File upload handling and validation"
    echo ""
    
    print_status "step" "⚛️  Frontend Development"
    echo "   • React with modern hooks"
    echo "   • TailwindCSS for styling"
    echo "   • Responsive design and mobile support"
    echo "   • Component-based architecture"
    echo "   • API integration with axios"
    echo ""
    
    print_status "step" "🗄️  Database"
    echo "   • PostgreSQL with proper schema"
    echo "   • Sample data for testing"
    echo "   • Indexes for performance"
    echo "   • Foreign key relationships"
    echo ""
    
    print_status "step" "🐳 Docker Support"
    echo "   • PostgreSQL container"
    echo "   • Redis for caching (optional)"
    echo "   • MinIO for file storage (optional)"
    echo "   • Adminer for database management"
    echo ""
}

# Main demo function
main() {
    echo "Welcome to the ARMS Platform Demo!"
    echo "This script will show you all the features and how to use them."
    echo ""
    
    while true; do
        echo "Choose an option:"
        echo "1. Check service status"
        echo "2. Show platform features"
        echo "3. Show sample data"
        echo "4. Show API endpoints"
        echo "5. Show usage instructions"
        echo "6. Show development features"
        echo "7. Exit"
        echo ""
        read -p "Enter your choice (1-7): " choice
        
        case $choice in
            1)
                check_services
                ;;
            2)
                show_features
                ;;
            3)
                show_sample_data
                ;;
            4)
                show_api_endpoints
                ;;
            5)
                show_usage
                ;;
            6)
                show_development
                ;;
            7)
                print_status "success" "Thank you for exploring the ARMS Platform!"
                exit 0
                ;;
            *)
                print_status "error" "Invalid choice. Please enter a number between 1-7."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        echo ""
    done
}

# Run demo
main "$@"

#!/bin/bash

# ARMS Platform Database Initialization Script
# This script sets up the PostgreSQL database with initial data

set -e

echo "🗄️  Initializing ARMS Platform Database..."
echo "=========================================="
echo ""

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-arms_platform}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres_password}

# Check if PostgreSQL is running
check_postgres() {
    echo "🔍 Checking PostgreSQL connection..."
    
    if ! PGPASSWORD=$DB_PASSWORD pg_isready -h $DB_HOST -p $DB_PORT -U postgres > /dev/null 2>&1; then
        echo "❌ Cannot connect to PostgreSQL at $DB_HOST:$DB_PORT"
        echo "   Make sure PostgreSQL is running and accessible"
        exit 1
    fi
    
    echo "✅ PostgreSQL connection successful"
    echo ""
}

# Create database and user
setup_database() {
    echo "🔧 Setting up database and user..."
    
    # Create arms_user if it doesn't exist
    echo "👤 Creating database user..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -c "SELECT 1 FROM pg_roles WHERE rolname='arms_user'" | grep -q 1 || \
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -c "CREATE USER arms_user WITH PASSWORD 'arms_password';"
    
    # Create database if it doesn't exist
    echo "📊 Creating database..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -c "CREATE DATABASE $DB_NAME OWNER arms_user;"
    
    # Grant privileges
    echo "🔐 Granting privileges..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO arms_user;"
    
    echo "✅ Database setup complete!"
    echo ""
}

# Create tables
create_tables() {
    echo "📋 Creating database tables..."
    
    PGPASSWORD=arms_password psql -h $DB_HOST -p $DB_PORT -U arms_user -d $DB_NAME << 'EOF'
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN')),
    upload_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Course enrollment table
CREATE TABLE IF NOT EXISTS user_courses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, course_id)
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size BIGINT,
    content_type VARCHAR(50) NOT NULL,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    uploader_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('news', 'announcement')),
    author_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_pinned BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_materials_course_id ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_uploader_id ON materials(uploader_id);
CREATE INDEX IF NOT EXISTS idx_materials_content_type ON materials(content_type);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_news_type ON news(type);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON news(author_id);

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
CREATE SEQUENCE IF NOT EXISTS courses_id_seq;
CREATE SEQUENCE IF NOT EXISTS materials_id_seq;
CREATE SEQUENCE IF NOT EXISTS news_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_courses_id_seq;

-- Set sequences to start from 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE courses_id_seq RESTART WITH 1;
ALTER SEQUENCE materials_id_seq RESTART WITH 1;
ALTER SEQUENCE news_id_seq RESTART WITH 1;
ALTER SEQUENCE user_courses_id_seq RESTART WITH 1;
EOF

    echo "✅ Tables created successfully!"
    echo ""
}

# Insert sample data
insert_sample_data() {
    echo "📝 Inserting sample data..."
    
    PGPASSWORD=arms_password psql -h $DB_HOST -p $DB_PORT -U arms_user -d $DB_NAME << 'EOF'
-- Insert sample users
INSERT INTO users (email, password, first_name, last_name, role, upload_count) VALUES
('admin@university.edu', '$2a$10$dummy.hash.for.demo', 'Admin', 'User', 'ADMIN', 0),
('prof.johnson@university.edu', '$2a$10$dummy.hash.for.demo', 'Michael', 'Johnson', 'FACULTY', 45),
('prof.smith@university.edu', '$2a$10$dummy.hash.for.demo', 'Sarah', 'Smith', 'FACULTY', 32),
('sarah.chen@university.edu', '$2a$10$dummy.hash.for.demo', 'Sarah', 'Chen', 'STUDENT', 156),
('alex.kumar@university.edu', '$2a$10$dummy.hash.for.demo', 'Alex', 'Kumar', 'STUDENT', 142),
('emily.rodriguez@university.edu', '$2a$10$dummy.hash.for.demo', 'Emily', 'Rodriguez', 'STUDENT', 128)
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (code, name, description, color) VALUES
('CS101', 'Data Structures', 'Introduction to fundamental data structures and algorithms', '#3B82F6'),
('CS201', 'Operating Systems', 'Principles of operating system design and implementation', '#10B981'),
('CS301', 'Database Systems', 'Database design, implementation, and management', '#8B5CF6'),
('MATH101', 'Linear Algebra', 'Fundamental concepts of linear algebra and matrix operations', '#F59E0B'),
('CS401', 'Machine Learning', 'Introduction to machine learning algorithms and applications', '#EF4444'),
('CS501', 'Software Engineering', 'Software development methodologies and best practices', '#6366F1')
ON CONFLICT (code) DO NOTHING;

-- Insert sample user-course enrollments
INSERT INTO user_courses (user_id, course_id) 
SELECT u.id, c.id FROM users u, courses c 
WHERE u.role = 'STUDENT' AND c.code IN ('CS101', 'CS201', 'CS301')
ON CONFLICT DO NOTHING;

-- Insert sample materials
INSERT INTO materials (title, description, file_url, file_name, file_type, file_size, content_type, course_id, uploader_id) VALUES
('Introduction to Arrays', 'Comprehensive notes covering array data structure', '/uploads/arrays_notes.pdf', 'arrays_notes.pdf', 'PDF', 2048000, 'notes', 1, 2),
('Sorting Algorithms', 'Implementation of various sorting algorithms', '/uploads/sorting_algorithms.zip', 'sorting_algorithms.zip', 'ZIP', 1536000, 'code', 1, 2),
('Process Scheduling', 'Notes on CPU scheduling algorithms', '/uploads/process_scheduling.pdf', 'process_scheduling.pdf', 'PDF', 3072000, 'notes', 2, 3),
('SQL Basics', 'Introduction to SQL queries and database design', '/uploads/sql_basics.pdf', 'sql_basics.pdf', 'PDF', 2560000, 'notes', 3, 3),
('Linear Algebra Fundamentals', 'Core concepts and examples', '/uploads/linear_algebra.pdf', 'linear_algebra.pdf', 'PDF', 4096000, 'notes', 4, 2),
('Machine Learning Overview', 'Introduction to ML concepts and algorithms', '/uploads/ml_overview.pdf', 'ml_overview.pdf', 'PDF', 5120000, 'notes', 5, 2)
ON CONFLICT DO NOTHING;

-- Insert sample news
INSERT INTO news (title, content, type, author_id) VALUES
('New CS401 Machine Learning Materials Available', 'Latest lecture notes and assignments for Week 8 have been uploaded by Prof. Johnson.', 'announcement', 2),
('Database Systems Midterm Results', 'Midterm exam results and feedback are now available in CS301. Please check your grades.', 'news', 3),
('Welcome to Fall Semester 2024', 'Welcome back students! We have exciting new courses and materials available this semester.', 'announcement', 1)
ON CONFLICT DO NOTHING;

-- Update user upload counts
UPDATE users SET upload_count = (
    SELECT COUNT(*) FROM materials WHERE uploader_id = users.id
);
EOF

    echo "✅ Sample data inserted successfully!"
    echo ""
}

# Display database info
show_database_info() {
    echo "📊 Database Information:"
    echo "========================"
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Database: $DB_NAME"
    echo "Username: arms_user"
    echo ""
    
    echo "📋 Table Summary:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as rows
        FROM pg_stat_user_tables 
        ORDER BY tablename;
    "
    
    echo ""
    echo "👥 User Summary:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "
        SELECT 
            role,
            COUNT(*) as count
        FROM users 
        GROUP BY role 
        ORDER BY role;
    "
    
    echo ""
    echo "📚 Course Summary:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "
        SELECT 
            COUNT(*) as total_courses,
            COUNT(DISTINCT c.id) as courses_with_materials
        FROM courses c
        LEFT JOIN materials m ON c.id = m.course_id;
    "
}

# Main execution
main() {
    check_postgres
    setup_database
    create_tables
    insert_sample_data
    show_database_info
    
    echo "🎉 Database initialization complete!"
    echo ""
    echo "Next steps:"
    echo "1. Start the Spring Boot backend"
    echo "2. The application will automatically connect to the database"
    echo "3. You can now log in with any of the sample users:"
    echo "   - admin@university.edu (Admin)"
    echo "   - prof.johnson@university.edu (Faculty)"
    echo "   - sarah.chen@university.edu (Student)"
    echo ""
}

# Run main function
main "$@"

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

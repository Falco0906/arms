-- Create this file in your migration directory
-- Copy the SQL from Material-Entity.md file
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    content BYTEA NOT NULL,
    uploader_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('LECTURE_NOTES', 'ASSIGNMENTS', 'CODE', 'PRESENTATIONS', 'DOCUMENTS'))
);

-- Optimize BYTEA storage for better performance
ALTER TABLE materials ALTER COLUMN content SET STORAGE EXTERNAL;

-- Create indexes for better query performance
CREATE INDEX idx_materials_course_id ON materials(course_id);
CREATE INDEX idx_materials_uploader_id ON materials(uploader_id);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_upload_timestamp ON materials(upload_timestamp);
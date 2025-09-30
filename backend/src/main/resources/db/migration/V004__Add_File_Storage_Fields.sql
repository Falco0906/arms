-- Add new columns to existing materials table
ALTER TABLE materials ADD COLUMN IF NOT EXISTS original_filename TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS download_count BIGINT DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_materials_original_filename ON materials(original_filename);

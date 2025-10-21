-- Create annotations table if it doesn't exist
-- Run this in your PostgreSQL database before starting the backend

CREATE SEQUENCE IF NOT EXISTS annotation_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS annotations (
    id BIGINT PRIMARY KEY DEFAULT nextval('annotation_seq'),
    transformer_no VARCHAR(50) NOT NULL,
    inspection_no VARCHAR(50) NOT NULL,
    bbox VARCHAR(500) NOT NULL,
    polygon VARCHAR(2000),
    shape VARCHAR(20),
    class_name VARCHAR(100) NOT NULL,
    confidence DOUBLE PRECISION,
    annotation_type VARCHAR(50) NOT NULL,
    status VARCHAR(20),
    comment VARCHAR(1000),
    user_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_annotations_transformer_inspection 
ON annotations(transformer_no, inspection_no);

CREATE INDEX IF NOT EXISTS idx_annotations_status 
ON annotations(status);

-- Verify table was created
SELECT 'Annotations table ready!' as status;

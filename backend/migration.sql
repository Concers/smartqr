-- Add new columns to qr_codes table for Faz 1 MVP

-- Add type column
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'url';

-- Add content column (JSON)
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}';

-- Add settings column (JSON) 
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Add expiresAt column
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS expiresAt TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_type ON qr_codes(type);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at);

-- Update existing records to have default type
UPDATE qr_codes SET type = 'url' WHERE type IS NULL;

-- Update existing records to have empty content
UPDATE qr_codes SET content = '{}' WHERE content IS NULL;

-- Update existing records to have empty settings
UPDATE qr_codes SET settings = '{}' WHERE settings IS NULL;

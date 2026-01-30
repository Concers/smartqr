-- Migration: Add Subdomain System
-- Description: Add custom subdomain and custom domain functionality

-- Add columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subdomain VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS subdomain_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS custom_domain_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_custom_domain VARCHAR(255) UNIQUE;

-- Add columns to qr_codes table
ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS custom_domain_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_url VARCHAR(255);

-- Create custom_domains table
CREATE TABLE IF NOT EXISTS custom_domains (
  id TEXT PRIMARY KEY DEFAULT (cuid()),
  user_id TEXT NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  dns_verified BOOLEAN DEFAULT FALSE,
  ssl_configured BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255) UNIQUE,
  admin_notes TEXT,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_domains_updated_at 
    BEFORE UPDATE ON custom_domains 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert existing users with random subdomains (optional)
-- This will be handled by the application logic when users log in/register

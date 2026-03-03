-- Fintelligence Database Initialization Script
-- This script runs automatically on first container startup

-- Ensure we are connected to the fintelligence database
\connect fintelligence;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Verify extensions are enabled
DO $$
BEGIN
  RAISE NOTICE 'Fintelligence database initialized successfully';
  RAISE NOTICE 'Enabled extensions: uuid-ossp, pgcrypto, citext';
END
$$;

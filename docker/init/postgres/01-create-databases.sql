-- Create databases for different environments
CREATE DATABASE atlas_ai_dev;
CREATE DATABASE atlas_ai_test;

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

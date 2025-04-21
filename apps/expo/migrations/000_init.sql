-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create role enum type
DO $$ BEGIN
    CREATE TYPE role AS ENUM ('player', 'developer', 'staff');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create app state enum type
DO $$ BEGIN
    CREATE TYPE state AS ENUM ('draft', 'pending', 'published', 'rejected', 'hidden');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logto_id TEXT UNIQUE NOT NULL,
  email TEXT,
  role role NOT NULL DEFAULT 'player',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create apps table
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hero_url TEXT,
  category TEXT,
  geo_area GEOMETRY(Point, 4326), -- PostGIS point geometry with WGS84 coordinate system
  price_cents INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  state TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create versions table
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id),
  semver TEXT NOT NULL,
  changelog TEXT,
  lighthouse_score INTEGER,
  repo_url TEXT,
  deploy_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, semver) -- Ensures version numbers are unique per app
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  app_id UUID REFERENCES apps(id),
  user_id UUID REFERENCES users(id),
  event TEXT NOT NULL,
  ts TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id),
  stripe_charge_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL,
  ts TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index on apps.geo_area
CREATE INDEX IF NOT EXISTS idx_apps_geo_area ON apps USING GIST (geo_area);

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_apps_owner_id ON apps (owner_id);
CREATE INDEX IF NOT EXISTS idx_versions_app_id ON versions (app_id);
CREATE INDEX IF NOT EXISTS idx_analytics_app_id ON analytics (app_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_app_id ON payments (app_id);
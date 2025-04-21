# Pincast Expo Database Schema

This document provides an overview of the database schema for the Pincast Expo marketplace platform, including tables, relationships, and instructions for running migrations.

## Schema Overview

The Pincast Expo database is built on Vercel Postgres with the PostGIS extension for spatial queries. The schema consists of five main tables:

### 1. Users

The `users` table stores user information synced from Logto authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| logto_id | text | Unique identifier from Logto (NOT NULL, UNIQUE) |
| email | text | User's email address |
| role | enum | User role ('player', 'developer', 'staff') |
| created_at | timestamptz | Account creation timestamp |

### 2. Apps

The `apps` table contains marketplace application metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| owner_id | uuid | Foreign key to users(id) |
| title | text | App title (NOT NULL) |
| slug | text | URL-friendly unique identifier (NOT NULL, UNIQUE) |
| hero_url | text | URL to app's hero image |
| category | text | App category |
| geo_area | geometry(Point,4326) | Geo coordinates (PostGIS point type) |
| price_cents | integer | Price in cents (default: 0) |
| is_paid | boolean | Whether the app requires payment (default: false) |
| state | enum | App status ('draft', 'pending', 'published', 'hidden') |
| created_at | timestamptz | App creation timestamp |

### 3. Versions

The `versions` table tracks app releases.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| app_id | uuid | Foreign key to apps(id) |
| semver | text | Semantic version string (NOT NULL) |
| changelog | text | Version changelog |
| lighthouse_score | integer | Performance score |
| repo_url | text | Repository URL |
| deploy_url | text | Deployment URL |
| created_at | timestamptz | Version creation timestamp |

*Note:* There is a unique constraint on (app_id, semver) to ensure version uniqueness per app.

### 4. Analytics

The `analytics` table stores event data.

| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| app_id | uuid | Foreign key to apps(id) |
| user_id | uuid | Foreign key to users(id) |
| event | text | Event type (NOT NULL) |
| ts | timestamptz | Event timestamp |

### 5. Payments

The `payments` table tracks financial transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| app_id | uuid | Foreign key to apps(id) |
| stripe_charge_id | text | Stripe charge ID (UNIQUE) |
| amount_cents | integer | Payment amount in cents (NOT NULL) |
| fee_cents | integer | Platform fee in cents (NOT NULL) |
| ts | timestamptz | Payment timestamp |

## Entity Relationships

```
                 ┌─────────┐
                 │  users  │
                 └────┬────┘
                      │
           ┌──────────┴──────────┐
           │                     │
      ┌────▼─────┐          ┌────▼─────┐
      │   apps   │◄─────────┤ analytics│
      └────┬─────┘          └──────────┘
           │
  ┌─────────┴───────┐
  │                 │
┌─▼───────┐   ┌─────▼────┐
│ versions│   │ payments │
└─────────┘   └──────────┘
```

## PostGIS Spatial Features

The `geo_area` column in the `apps` table uses PostGIS geometry type to store location data as WGS84 points. This enables spatial queries like:

- Find apps within a certain distance of a location
- Calculate distance between user and app locations
- Support area-based search and filtering

## Running Migrations

### Local Development

To set up the database locally:

1. Install dependencies: 
   ```bash
   pnpm install
   ```

2. Set environment variables in `.env`:
   ```
   POSTGRES_URL=postgres://username:password@localhost:5432/pincast
   ```

3. Run migrations:
   ```bash
   pnpm db:migrate
   ```

4. Seed the database with sample data:
   ```bash
   pnpm db:seed
   ```

### Vercel Deployment

For Vercel deployments:

1. Set the `POSTGRES_URL` environment variable in the Vercel dashboard to your Vercel Postgres connection string.

2. The migrations will run automatically during the build process as part of the CI/CD pipeline.

## Migration Strategy

This project uses a combination of:

1. **Direct SQL migrations** (`migrations/000_init.sql`) for schema initialization
2. **Drizzle ORM** for type-safe database access and model definitions

To generate new migrations after schema changes:

```bash
pnpm db:generate
```

## Testing the Database

To run database tests:

```bash
# Set test database URL
export PG_URL_TEST=postgres://username:password@localhost:5432/pincast_test

# Run tests
pnpm test
```

The tests verify:
- Slug uniqueness constraints
- Spatial query functionality (finding apps within distance)
- Basic CRUD operations on all tables

## Working with PostGIS

Important PostGIS functions used in this project:

- `ST_SetSRID(ST_Point(lng, lat), 4326)`: Creates a point with WGS84 coordinates
- `ST_DWithin(geo1, geo2, distance)`: Checks if two geometries are within specified distance
- `ST_Distance(geo1, geo2)`: Calculates distance between two geometries

For more PostGIS functions, see the [official documentation](https://postgis.net/docs/).
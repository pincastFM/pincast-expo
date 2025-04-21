# Pincast Expo App

## Overview

This is the marketplace application for the Pincast Expo platform, allowing:
- Users to browse and install location-based apps
- Developers to submit and manage their applications
- Staff to approve, reject, and manage the marketplace

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp ../../.env.example ../../.env
   ```
   
3. Set up the database:
   ```bash
   # Using the automated setup script (recommended)
   ./scripts/setup-dev.sh
   
   # Or manually:
   NODE_OPTIONS="--loader ts-node/esm" npx ts-node scripts/run-migrations.ts
   NODE_OPTIONS="--loader ts-node/esm" npx ts-node server/seed.ts
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Database

The application uses Vercel Postgres with PostGIS for spatial queries. See [docs/schema.md](docs/schema.md) for detailed documentation on the database schema.

### Database Commands

- `NODE_OPTIONS="--loader ts-node/esm" npx ts-node scripts/run-migrations.ts` - Run database migrations
- `NODE_OPTIONS="--loader ts-node/esm" npx ts-node server/seed.ts` - Seed the database with sample data
- `./scripts/setup-dev.sh` - Run both migrations and start the dev server
- `pnpm db:generate` - Generate Drizzle migrations from schema changes
- `pnpm db:studio` - Launch Drizzle Studio for visual database management

### Testing the Database

```bash
# Make sure you have the test database URL set
export PG_URL_TEST=postgres://username:password@localhost:5432/pincast_test

# Run tests
pnpm test
```

## Authentication

Authentication is handled via Logto.io with three user roles:

| Role | Access |
|------|--------|
| player | Browse and install apps |
| developer | All player rights + submit/manage apps |
| staff | All rights + approve/reject/rollback apps |

## File Structure

```
apps/expo/
 ├─ components/     # Vue components
 ├─ composables/    # Vue composables
 ├─ docs/           # Documentation
 ├─ migrations/     # Database migrations
 ├─ pages/          # Vue pages
 │   └─ review/     # Staff review dashboard
 ├─ public/         # Static assets
 ├─ scripts/        # Utility scripts
 ├─ server/         # Server routes and utils
 │   ├─ api/        # API endpoints
 │   │   └─ review/ # Review API endpoints
 │   ├─ db/         # Database utilities
 │   └─ utils/      # Server utilities
 └─ test/           # Test files
```

## PostGIS and Spatial Data

This application uses PostGIS for spatial data to support location-based app discovery. Key features:

- Find apps within a certain radius
- Calculate distances between points
- Store app locations with proper georeferencing

For more information on PostGIS, refer to the [official documentation](https://postgis.net/docs/).
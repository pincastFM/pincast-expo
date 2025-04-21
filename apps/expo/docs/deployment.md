# Pincast Expo Deployment Guide

This guide explains how to deploy the Pincast Expo platform, including the Staff Review Dashboard, in different environments.

## Prerequisites

- Node.js 16+
- PostgreSQL with PostGIS extension
- Vercel account (for production deployments)
- Logto account (for authentication)

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pincast-expo/pincast-expo.git
cd pincast-expo
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root with:

```
# Database
POSTGRES_URL=postgres://username:password@host:port/database

# Authentication
LOGTO_ENDPOINT=https://your-logto-instance.example.com
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_COOKIE_ENCRYPTION_KEY=your-encryption-key

# For seeding (optional)
SEED_LOGTO_ID_STAFF=staff-1234
SEED_EMAIL_STAFF=staff@pincast.fm
SEED_LOGTO_ID_DEV=dev-1234
SEED_EMAIL_DEV=developer@pincast.fm
```

### 4. Database Setup

Ensure PostgreSQL is running with the PostGIS extension:

```bash
cd apps/expo
NODE_OPTIONS="--loader ts-node/esm" npx ts-node scripts/run-migrations.ts
NODE_OPTIONS="--loader ts-node/esm" npx ts-node server/seed.ts
```

### 5. Run the Development Server

```bash
# Using the setup script
./scripts/setup-dev.sh

# Or directly
pnpm run dev
```

The app will be available at http://localhost:3000.

## Staging Environment

### Using Vercel Preview Deployments

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up a Vercel Postgres database with PostGIS
4. Deploy to a preview environment using:

```bash
vercel
```

### Running the Database Migration

For Vercel preview environments, you can run migrations using:

```bash
vercel env pull .env.local  # Get environment variables
NODE_OPTIONS="--loader ts-node/esm" npx ts-node scripts/run-migrations.ts
```

## Production Deployment

### Using Vercel

1. Configure production environment variables in Vercel dashboard
2. Set up a production Vercel Postgres database with PostGIS
3. Deploy to production using:

```bash
vercel --prod
```

### Database Management for Production

For production databases, always back up before running migrations:

```bash
# Backup (requires pg_dump)
pg_dump -c -O -x -h $DB_HOST -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# Run migrations
NODE_OPTIONS="--loader ts-node/esm" npx ts-node scripts/run-migrations.ts
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify the `POSTGRES_URL` format: `postgres://username:password@host:port/database`
2. Check if PostgreSQL is running and accessible from your environment
3. Ensure the PostGIS extension is installed: `SELECT PostGIS_version();`

### Migration Failures

If migrations fail:

1. Check the database logs for detailed error messages
2. Verify that the PostgreSQL user has appropriate permissions
3. Try running each SQL statement in the migration manually to identify the issue

### Authentication Problems

For Logto authentication issues:

1. Verify all Logto environment variables
2. Check Logto dashboard for integration status
3. Review Logto logs for authentication failures

## Monitoring

Once deployed, monitor the application using:

- Vercel dashboard for server logs and performance
- PostgreSQL monitoring tools for database health
- Customer.io for user tracking (if integrated)

## Deployment Checklist

- [ ] Environment variables configured correctly
- [ ] Database migrations run successfully
- [ ] PostGIS extension verified
- [ ] Authentication system tested
- [ ] Staff accounts created with proper roles
- [ ] Review dashboard accessible to staff users only
- [ ] Basic marketplace functionality tested
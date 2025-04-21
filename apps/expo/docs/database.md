# Database Configuration Guide

This guide explains how to work with the development and production database environments in the Pincast Expo project.

## Environment Setup

The application supports three database environments:

- **Development**: For local development work
- **Production**: For the live application
- **Test**: For automated testing

## Configuration Files

Environment-specific database connection strings are stored in separate `.env` files:

- `.env.development` - Development database settings
- `.env.production` - Production database settings
- `.env.test` - Test database settings

These files override the values in the base `.env` file.

## Using Environment-Specific Commands

We've added npm scripts to target specific environments:

```bash
# Development environment
npm run db:migrate:dev   # Run migrations on development database
npm run db:seed:dev      # Seed development database
npm run db:check:dev     # Check development database
npm run db:studio:dev    # Open Drizzle Studio for development database

# Production environment
npm run db:migrate:prod  # Run migrations on production database
npm run db:seed:prod     # Seed production database
npm run db:check:prod    # Check production database
npm run db:studio:prod   # Open Drizzle Studio for production database
```

## Setting Up Your Local Environment

1. **Create Development Database**:
   ```sql
   CREATE DATABASE pincast_dev;
   ```

2. **Configure Environment**:
   Edit `.env.development` with your local database credentials:
   ```
   POSTGRES_URL=postgres://username:password@localhost:5432/pincast_dev
   POSTGRES_URL_NON_POOLING=postgres://username:password@localhost:5432/pincast_dev
   ```

3. **Run Migrations**:
   ```bash
   npm run db:migrate:dev
   ```

4. **Seed Database**:
   ```bash
   npm run db:seed:dev
   ```

## Production Setup

1. **Configure Production Environment**:
   Update `.env.production` with your production database credentials.

2. **Run Migrations (with caution)**:
   ```bash
   npm run db:migrate:prod
   ```

## Checking Environment

You can verify your connection to each database with:

```bash
npm run db:check:dev
npm run db:check:prod
```

This will show which database you're connected to and display basic information about its contents.
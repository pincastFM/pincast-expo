# Pincast Expo

Cursor-first SDK, VS Code extension, and CLI platform for building and deploying location-based experiences to the Pincast ecosystem.

## Project Overview

Pincast Expo enables VS Code users to build, test, and publish full-stack location-based experiences to the Pincast platform with just two commands:

```
⌘⇧P  »  Pincast: Enable Expo   # scaffolds SDK & auth
pincast deploy                # builds + registers app (state=pending)
```

## Components

| Component | Description |
|-----------|-------------|
| **Cursor Extension** | VS Code marketplace package with palette commands for enabling and publishing Expo apps |
| **@pincast/sdk** | NPM package with Nuxt 3 composables for location, data, and analytics with Logto auth wrapper |
| **pincast CLI** | Command-line tool for local development, build, and deployment |
| **Expo API** | CI endpoint for registering and updating apps |
| **Staff Dashboard** | Internal tool for reviewing and approving submitted apps |
| **Marketplace Catalog** | Public API for discovering geo-filtered experiences |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- VS Code with Cursor extension
- Logto account (for authentication)

### Development Setup

1. Install the Pincast extension from VS Code marketplace or setup with CLI:
   ```bash
   npm i -g pincast
   pincast init
   ```

2. Use the palette command `Pincast: Enable Expo` in VS Code or manually:
   ```bash
   pnpm add @pincast/sdk
   ```

3. Configure your app in `pincast.json`:
   ```json
   {
     "title": "My Awesome App",
     "slug": "my-awesome-app",
     "geo": {
       "center": [-73.93, 40.72],
       "radiusMeters": 1500
     }
   }
   ```

4. Develop your app using the SDK composables:
   ```typescript
   const { position, nearby } = usePincastLocation()
   const { store, query } = usePincastData('collection-name')
   const { track } = useAnalytics()
   ```

5. Deploy your app:
   ```bash
   pincast deploy
   ```

### CLI Commands

- `pincast init` - Clone starter template and set environment variables
- `pincast dev` - Start Nuxt development server with local proxy
- `pincast deploy` - Build, upload, and register a new version
- `pincast login` - Authenticate with Logto to get a developer token

### Authentication Roles

The application uses a role-based access control system with three roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| `player` | Default role for all users | Can browse and install apps |
| `developer` | App developers | All player rights + submit/manage apps |
| `staff` | Pincast staff | All rights + approve/reject/rollback apps |

Roles are managed through Logto claims. The SDK handles token exchange for scoped app access.

## Data API

The SDK provides access to a namespaced data API for each app:

```typescript
// Store data
await store('items', { id: 'unique-id', name: 'Item name' })

// Query data
const items = await query('items', { near: position.value })
```

Data is automatically namespaced to your app and stored in Postgres with PostGIS support for geospatial queries.

## Technical Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed technical specification and development roadmap.
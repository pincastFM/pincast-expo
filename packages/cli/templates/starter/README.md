# Pincast Starter App

This is a starter template for a Pincast location-based experience, created with the `pincast create` command.

## Features

- Nuxt 3 framework for Vue.js
- Built-in Pincast SDK for authentication, location, and data services
- Mapbox integration for interactive maps
- Demo quest with checkpoint detection
- TypeScript for type safety
- Pre-configured for deployment to Pincast

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Mapbox account for access token

### Setup

1. Configure your environment variables by editing the `.env` file:

```env
# Pincast Environment Configuration
PINCAST_API_URL=http://localhost:8787

# Logto Authentication
LOGTO_ENDPOINT=https://auth.pincast.fm
LOGTO_APP_ID=pincast-expo-app
LOGTO_APP_SECRET=placeholder

# Mapbox Configuration
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:

```bash
npm run dev
# or
pincast dev
```

## Development

### Directory Structure

- `pages/` - Nuxt pages
- `components/` - Vue components
- `composables/` - Reusable composition functions
- `public/` - Static assets

### Adding New Checkpoints

Edit the checkpoints array in `pages/index.vue` to add new locations to your quest:

```typescript
const checkpoints = ref([
  {
    name: 'My New Checkpoint',
    description: 'Description of the location',
    lat: 37.7749, // Latitude
    lng: -122.4194, // Longitude
    found: false,
    distance: 0
  },
  // Add more checkpoints here
]);
```

### Using Pincast SDK

This template comes with the Pincast SDK pre-configured, giving you access to:

- `useAuth()` - Authentication composable for login/logout
- `usePincastLocation()` - Location services for player position
- `usePincastData()` - Data storage for saving game state
- `useAnalytics()` - Event tracking for player actions

## Deployment

To deploy your application to Pincast:

```bash
pincast deploy
```

This will build your application, upload the assets, and register your app with Pincast Expo.

## Learn More

- [Pincast SDK Documentation](https://docs.pincast.fm)
- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js)

## License

MIT
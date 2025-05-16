---
layout: default
title: Pincast Expo Cursor Extension
description: Build and deploy location-based experiences with Cursor
---

# Pincast Expo Cursor Extension

> Build, test, and deploy location-based experiences directly from Cursor with just two commands.

[![Version](https://img.shields.io/visual-studio-marketplace/v/pincast.expo)](https://marketplace.visualstudio.com/items?itemName=pincast.expo)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/pincast.expo)](https://marketplace.visualstudio.com/items?itemName=pincast.expo)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/pincast.expo)](https://marketplace.visualstudio.com/items?itemName=pincast.expo)

## Quick Start

```bash
# 1. Install the extension from VS Code marketplace
⌘⇧P  »  Extensions: Install Extension  »  "Pincast Expo"

# 2. Enable Pincast in your project
⌘⇧P  »  Pincast: Enable Expo

# 3. Deploy your app
pincast deploy
```

## Features

- 🌍 **Location-Based Development**: Build experiences tied to real-world locations
- 🚀 **Rapid Deployment**: Deploy directly from Cursor with a single command
- 📱 **Cross-Platform**: Works seamlessly on iOS, Android, and web browsers
- 🔒 **Built-in Auth**: Integrated authentication and authorization with Logto
- 📊 **Analytics**: Automatic event tracking and custom analytics via Customer.io
- 🗺️ **Geospatial Data**: PostGIS-powered location queries and storage
- 🛠️ **Developer Tools**: Rich debugging and testing tools built into Cursor

## Installation

### Prerequisites

- Node.js 18+
- pnpm 8+
- Cursor (VS Code) editor
- Logto account for authentication

### Extension Installation

1. Open Cursor
2. Press `⌘⇧P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type `Extensions: Install Extension`
4. Search for "Pincast Expo"
5. Click Install

### Project Setup

```bash
# Initialize a new project
pincast init my-awesome-app

# Configure your app in pincast.json
{
  "title": "My Awesome App",
  "slug": "my-awesome-app",
  "geo": {
    "center": [-73.93, 40.72],
    "radiusMeters": 1500
  }
}

# Start development
cd my-awesome-app
pincast dev
```

## Core Concepts

### Location Services

```typescript
const { location, startWatching, findNearbyItems } = usePincastLocation();

// Start tracking location
onMounted(() => {
  startWatching();
});

// Find nearby points
const nearbyPoints = computed(() => 
  findNearbyItems(points.value, {
    maxDistance: 500, // meters
    location: location.value
  })
);
```

### Data Management

```typescript
const { store, query, near } = usePincastData('points');

// Store a new point
await store({
  name: 'Central Park',
  location: { lat: 40.785091, lng: -73.968285 }
});

// Find points within 1km
const nearby = await near(userLocation, 1000);
```

### Analytics

```typescript
const { track, identify } = usePincastAnalytics();

// Identify user
identify(user.id, {
  email: user.email,
  name: user.name
});

// Track custom event
track('location_reached', {
  pointId: point.id,
  timeSpent: duration
});
```

## Command Palette

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Pincast: Enable Expo` | Initialize Pincast in project | ⌘⇧P |
| `Pincast: Deploy` | Deploy app to marketplace | ⌘⇧P |
| `Pincast: New Project` | Create new project from template | ⌘⇧P |
| `Pincast: Login` | Authenticate with Pincast | ⌘⇧P |

## Development Workflow

1. **Initialize Project**
   ```bash
   pincast init my-app
   cd my-app
   ```

2. **Configure Settings**
   - Edit `pincast.json` for app metadata
   - Set up environment in `.env.pincast`

3. **Develop Locally**
   ```bash
   pincast dev
   ```

4. **Test & Debug**
   - Use built-in location simulator
   - Test geofencing with mock coordinates
   - Debug with Chrome DevTools

5. **Deploy**
   ```bash
   pincast deploy
   ```

## Authentication & Authorization

### Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| player | Basic | Can use approved apps |
| developer | Enhanced | Can create and submit apps |
| staff | Full | Can approve and manage apps |

### Token Flow

1. Developer authenticates via Cursor extension
2. Tokens stored in `~/.pincast/config.json`
3. App users authenticate through Logto
4. JWT tokens scope access per app

## Data Storage

- **Collections**: Namespaced key-value storage
- **Geospatial**: Native PostGIS integration
- **Queries**: Rich query API with location support
- **Real-time**: Optional real-time subscriptions

## Analytics Integration

- **Automatic Events**
  - Session start/end
  - Location updates
  - Feature usage
  
- **Custom Events**
  - User interactions
  - Achievement tracking
  - Custom metrics

## CLI Reference

```bash
# Create new project
pincast init [name]

# Start development server
pincast dev

# Deploy to marketplace
pincast deploy [--prod]

# Authenticate
pincast login

# Update SDK
pincast update
```

## Troubleshooting

### Common Issues

1. **SDK Initialization Failed**
   - Check `.env.pincast` configuration
   - Verify Logto credentials
   - Ensure proper module registration

2. **Location Services Error**
   - Allow browser location access
   - Check device GPS settings
   - Verify SSL in development

3. **Deployment Issues**
   - Run `pincast doctor` for diagnostics
   - Check network connectivity
   - Verify build output

### Support

- [GitHub Issues](https://github.com/pincastfm/pincast-expo/issues)
- [Documentation](https://docs.pincast.fm)
- Email: support@pincast.fm

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

---

*Built with ❤️ by the Pincast team* 
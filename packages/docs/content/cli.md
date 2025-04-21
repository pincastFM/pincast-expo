---
title: Pincast CLI
description: The command-line interface for Pincast Expo development, testing, and deployment
---

# Pincast CLI

The Pincast CLI provides a set of commands for developing, testing, and deploying Pincast applications. It handles authentication, project initialization, local development, and deployment to the Pincast platform.

## Installation

You can install the Pincast CLI globally using npm, yarn, or pnpm:

```bash
# Using npm
npm install -g pincast

# Using yarn
yarn global add pincast

# Using pnpm
pnpm add -g pincast
```

After installation, you can verify it's working by running:

```bash
pincast --version
```

## Commands Overview

| Command | Description |
|---------|-------------|
| `pincast login` | Authenticate with Pincast |
| `pincast logout` | Log out from Pincast |
| `pincast init` | Initialize a Pincast project in an existing directory |
| `pincast create [dir]` | Create a new Pincast project from a template |
| `pincast dev` | Start a local development server with API proxy |
| `pincast deploy` | Deploy your application to Pincast |
| `pincast help` | Show help information |

## Authentication

Before using most CLI commands, you need to authenticate with Pincast:

```bash
pincast login
```

This will start a device flow authentication process:

1. The CLI will display a URL and a device code
2. Open the URL in your browser
3. Enter the device code
4. Authorize the CLI to access your Pincast account

Once authenticated, your credentials will be stored securely for future use.

To log out:

```bash
pincast logout
```

## Creating a New Project

The easiest way to start a new project is with the `create` command:

```bash
pincast create my-app
```

This will:
1. Create a new directory with the specified name
2. Copy a starter template with Nuxt 3 and the Pincast SDK
3. Configure the project with the necessary files
4. Install dependencies

The created project includes:
- Nuxt 3 framework
- @pincast/sdk for authentication, location, and data services
- Mapbox integration for maps
- A demo quest with checkpoints
- TypeScript configuration

## Adding Pincast to an Existing Project

If you already have a Nuxt project and want to add Pincast to it:

```bash
cd your-existing-project
pincast init
```

This will:
1. Add the Pincast SDK and its dependencies to your project
2. Configure Nuxt to use the Pincast SDK
3. Create a `pincast.json` configuration file
4. Set up environment variables

## Local Development

To start a local development server:

```bash
pincast dev
```

This will:
1. Start the Nuxt development server
2. Set up a local API proxy to simulate the Pincast backend
3. Enable hot module reloading for rapid development

The development server will be available at http://localhost:3000 by default.

## Deployment

When you're ready to deploy your application:

```bash
pincast deploy
```

This will:
1. Build your application for production
2. Upload the assets to Pincast's servers
3. Register your app with the Pincast Expo platform
4. Place your app in the review queue

For production deployments:

```bash
pincast deploy --prod
```

## Configuration

Pincast uses two main configuration files:

1. `pincast.json` - Project configuration, including title, slug, and geo settings
2. `.env.pincast` - Environment variables for API keys and endpoints

Example `pincast.json`:

```json
{
  "title": "Zombie Run NYC",
  "slug": "zombie-run-nyc",
  "geo": {
    "center": [-73.93, 40.72],
    "radiusMeters": 1500
  }
}
```

Example `.env.pincast`:

```env
PINCAST_API_URL=http://localhost:8787
LOGTO_ENDPOINT=https://auth.pincast.fm
LOGTO_APP_ID=pincast-expo-app
LOGTO_APP_SECRET=your_secret_here
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

## CLI Reference

### `pincast login`

Authenticate with the Pincast platform using device flow.

```bash
pincast login
```

### `pincast logout`

Log out and remove stored credentials.

```bash
pincast logout
```

### `pincast init`

Initialize a Pincast project in the current directory. Must be run in a Nuxt project or empty directory.

```bash
pincast init
```

### `pincast create [dir]`

Create a new Pincast project from the starter template.

```bash
pincast create my-app
```

Options:
- `dir` - The directory name for the new project (optional, will prompt if not provided)

### `pincast dev`

Start a local development server with API proxy.

```bash
pincast dev
```

### `pincast deploy`

Build and deploy your application to Pincast.

```bash
pincast deploy
```

Options:
- `--prod` - Deploy to production (default is staging)

### `pincast help`

Show help information about Pincast CLI commands.

```bash
pincast help
# or
pincast help [command]
```
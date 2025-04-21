---
title: Getting Started with Pincast Expo
description: Learn how to create your first location-based experience with Pincast Expo
---

# Getting Started with Pincast Expo

Welcome to Pincast Expo! This guide will walk you through setting up your development environment and creating your first location-based application.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.sh/) (recommended)
- A [Mapbox account](https://account.mapbox.com/auth/signup/) for access token

## Step 1: Install the Pincast Extension

The easiest way to get started is with our VS Code extension, which provides palette commands for creating and publishing Pincast apps.

<div class="flex justify-center my-6">
  <img src="/extension-install.gif" alt="Installing the Pincast Extension" class="rounded-lg shadow-lg" />
</div>

1. Open VS Code or Cursor
2. Go to the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Pincast Expo"
4. Click **Install**

Alternatively, you can install the Pincast CLI globally:

```bash
npm install -g pincast
```

## Step 2: Create a New Project

With the extension installed, you can now create a new Pincast project:

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P` to open the command palette
2. Type "Pincast: Create Project" and select it
3. Choose a directory for your new project

Alternatively, use the CLI:

```bash
pincast create my-first-app
cd my-first-app
```

This will:
- Create a new Nuxt 3 project
- Install the Pincast SDK and its dependencies
- Configure Mapbox integration
- Set up a sample application with location tracking

## Step 3: Configure Your Environment

The created project includes a `.env` file that you'll need to configure:

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

Replace `your_mapbox_token_here` with your Mapbox access token.

## Step 4: Authenticate with Pincast

Before developing, you'll need to authenticate with Pincast:

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P` to open the command palette
2. Type "Pincast: Login" and select it
3. Follow the device flow authentication process

Alternatively, use the CLI:

```bash
pincast login
```

## Step 5: Start the Development Server

Once authenticated, you can start the development server:

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P` to open the command palette
2. Type "Pincast: Start Dev Server" and select it

Alternatively, use the CLI:

```bash
pincast dev
```

This will start a local development server at http://localhost:3000 with hot module reloading.

## Step 6: Explore Your First App

Open your browser and navigate to http://localhost:3000 to see your application running.

The starter template includes:
- A home page with a Mapbox map
- User authentication via Logto
- A sample quest with three checkpoints
- Player location tracking

<div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg my-6 border-l-4 border-blue-500">
  <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300">Pro Tip</h3>
  <p class="text-blue-700 dark:text-blue-300">
    When testing location-based features, use Chrome's DevTools to simulate different GPS coordinates. Open DevTools, click the three dots menu, go to "More tools" > "Sensors", and set your desired location.
  </p>
</div>

## Step 7: Deploy Your App

When you're ready to deploy your application:

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P` to open the command palette
2. Type "Pincast: Deploy" and select it

Alternatively, use the CLI:

```bash
pincast deploy
```

<DemoDeploy 
  title="Deployment Terminal"
  command="pincast deploy"
  :output="[
    { text: 'Authenticating with Pincast...' },
    { text: 'Building application...' },
    { text: 'Build successful!' },
    { text: 'Uploading assets to Pincast...' },
    { text: 'Registering app with Pincast Expo...' },
    { text: 'App registered successfully. App ID: 8f7e6d5c-4b3a-2a1b-0c9d-8e7f6d5c4b3a' },
    { text: 'Your app is now in review. You can check its status at:' },
    { text: 'https://expo.pincast.fm/dashboard/8f7e6d5c-4b3a-2a1b-0c9d-8e7f6d5c4b3a' }
  ]"
  demoUrl="https://expo.pincast.fm/dashboard/8f7e6d5c-4b3a-2a1b-0c9d-8e7f6d5c4b3a"
  autoStart
/>

This will:
- Build your application
- Upload the assets to Pincast's servers
- Register your app with Pincast Expo
- Place your app in the review queue

Once approved, your app will be available to users in the Pincast Expo catalog!

## Next Steps

Now that you have your first Pincast app up and running, check out these resources to learn more:

- [Understanding the SDK](/sdk) - Explore the Pincast SDK composables
- [CLI Commands](/cli) - Learn about all available CLI commands
- [Build a Quest](/tutorials/quest) - Create a full-featured quest app
- [Authentication Concepts](/concepts/auth) - Deep dive into Pincast's authentication
- [App Review Process](/staff/review) - Understand how apps are reviewed
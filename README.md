# Pincast Expo

A marketplace platform for the Pincast ecosystem that allows vibe coders to publish their apps to pincast.fm.

## Project Overview

Pincast Expo integrates with the existing Pincast platform, leveraging components from:
- treehopper-v3: A location-based tree collection app
- NYID: A location-based audio experience platform
- NuxtSitev1: The main marketing site (pincast.fm)

## Key Features

- Authentication through Logto.io for all users
- User analytics via Customer.io
- App submission and publication workflow
- Marketplace browsing and discovery

## Repository Structure

```
pincast-expo/
├── apps/
│   └── expo/           # Main marketplace application
├── .github/            # GitHub Actions workflows
├── .husky/             # Git hooks
├── CLAUDE.md           # Technical documentation
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/[username]/pincast-expo.git
   cd pincast-expo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```
   
4. Visit `http://localhost:3000` in your browser.

## Technical Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed technical documentation about the integration points with other Pincast repositories.
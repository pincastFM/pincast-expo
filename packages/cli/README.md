# Pincast CLI

Command-line interface for Pincast development. This CLI provides tools for creating, developing, and deploying Pincast applications.

## Installation

```bash
# Install globally
npm install -g pincast

# Or use with npx
npx pincast
```

## Quick Start

```bash
# Authenticate with Pincast
pincast login

# Initialize a new project
mkdir my-pincast-app
cd my-pincast-app
pincast init

# Start development server
pincast dev

# Deploy to preview
pincast deploy

# Deploy to production
pincast deploy --prod
```

## Commands

### `pincast login`

Authenticates with Pincast using device flow. This command will:

1. Start the Logto device flow
2. Open a browser window for authentication
3. Save the authentication tokens to `~/.pincast/config.json`

```bash
pincast login
```

### `pincast logout`

Logs out from Pincast by clearing stored credentials.

```bash
pincast logout
```

### `pincast init`

Initializes a new Pincast project or adds Pincast to an existing Nuxt project.

If run in an empty directory, it will clone the starter template. If run in an existing Nuxt project, it will add the Pincast SDK and create configuration files.

```bash
# In an empty directory - creates a new project
pincast init

# In an existing Nuxt project - adds Pincast SDK
pincast init
```

### `pincast dev`

Starts a local development server with API proxy.

1. Runs a local proxy server on port 8787 that mocks the Pincast API
2. Starts your application's development server (using npm/yarn/pnpm)
3. Redirects API requests to the local proxy

```bash
pincast dev
```

### `pincast deploy`

Builds and deploys your Pincast application.

1. Runs the build command
2. Uploads the build to Vercel
3. Registers the app with the Pincast Expo platform
4. Returns the dashboard URL

```bash
# Deploy to preview
pincast deploy

# Deploy to production
pincast deploy --prod
```

## Development

To develop the CLI locally:

```bash
# Clone the repository
git clone https://github.com/pincast/pincast-expo.git
cd pincast-expo

# Install dependencies
pnpm install

# Build the CLI
pnpm --filter pincast build

# Run the CLI locally
node packages/cli/dist/index.js
```

## Configuration

The CLI creates and uses the following configuration files:

- `~/.pincast/config.json`: Global configuration for authentication
- `./pincast.json`: Project-specific configuration
- `./.env.pincast`: Environment variables for local development

## License

MIT
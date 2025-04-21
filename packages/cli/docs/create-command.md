# Pincast Create Command

The `pincast create` command provides a streamlined way to scaffold a new Pincast application with all the necessary components pre-configured.

## Usage

```bash
pincast create [dir]
```

Where `[dir]` is the name of the directory where you want to create your new project. If not provided, you will be prompted to enter a directory name.

## Features

The `create` command sets up a Nuxt 3 project with:

- Pre-wired `@pincast/sdk` for authentication, location data services, and analytics
- Mapbox integration with player location tracking
- A demo quest with three checkpoints
- TypeScript support with proper configuration
- Essential project files and structure

## Template Structure

The scaffolded project includes:

- `app.vue` - Main application component with authentication UI
- `pages/index.vue` - Homepage with interactive map and quest UI
- `nuxt.config.ts` - Nuxt configuration with SDK and Mapbox setup
- `pincast.json` - Project configuration for the Pincast platform
- `.env` - Environment variables for API keys and endpoints
- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript configuration
- `README.md` - Documentation for your new project

## Workflow

1. Run `pincast create my-app`
2. The command will:
   - Create a new directory called `my-app`
   - Copy the starter template files
   - Prompt for project details (title, slug, geo coordinates)
   - Update package.json with your project name
   - Create configuration files
   - Install dependencies
   - Initialize a git repository
3. Change to the new directory: `cd my-app`
4. Start the development server: `pincast dev`

## Customizing the Template

After creating your project, you can:

1. Edit the checkpoints in `pages/index.vue` to create your own quest
2. Modify styles and UI components to match your branding
3. Add additional pages for more complex experiences
4. Extend the map functionality with custom layers and interactions

## Deploying Your Application

Once your application is ready:

1. Run `pincast login` to authenticate with your Pincast account
2. Run `pincast deploy` to build and publish your application
3. Monitor the status of your deployment in the Pincast dashboard

Your application will be publicly available to players once approved by the Pincast staff.
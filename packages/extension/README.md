# Pincast Expo for VS Code

One-click setup for building location-based experiences with Pincast Expo.

![Pincast Expo Extension](media/demo.gif)

## Quick Start

Install via the deep-link: [vscode:extension/pincast.pincast-expo](vscode:extension/pincast.pincast-expo)

After installation:
1. Your workspace is automatically prepared with the Pincast SDK and configuration
2. Run `pincast create <name>` when you're ready to scaffold a starter project
3. Or start coding directly with Cursor AI prompts

## Features

Pincast Expo extension provides seamless integration with Pincast development tools:

- **One-Click Setup**: Automatically adds Pincast SDK to your Nuxt project on install
- **Scaffold on Demand**: Create starter projects with `pincast create` when you're ready
- **Publish to Marketplace**: Deploy your Pincast app with a single command
- **Login Management**: Authenticate with Pincast directly from VS Code
- **Status Monitoring**: View your authentication status right in the status bar

## Commands

The following commands are available:

- **Pincast: Enable Expo in Workspace** - Runs `pincast init` to set up your project (runs automatically on install)
- **Pincast: Publish to Marketplace** - Runs `pincast deploy` to publish your app
- **Pincast: Login** - Authenticates with Pincast using device flow
- **Pincast: Open Dashboard** - Opens the Pincast Expo dashboard in your browser

## Requirements

- VS Code 1.63.0 or higher
- Pincast CLI (`npm install -g pincast`)
- Node.js 16 or higher

## Extension Settings

No custom settings are required for this extension.

## Known Issues

- The extension requires the Pincast CLI to be installed globally

## Release Notes

### 0.2.0

- Improved extension installation flow with one-click setup
- Added automatic SDK enablement on first activation
- Added toast notification with helpful next steps
- Added direct "Run pincast create" button in toast
- Added "Open Docs" button that links to documentation
- Fixed multiple bugs in command execution

### 0.1.0

Initial release of Pincast Expo VS Code Extension

## Development

### Building the Extension

```bash
# Install dependencies
npm install

# Package the extension
npm run package
```

### Testing

```bash
# Run tests
npm test
```

## License

MIT
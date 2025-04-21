import chalk from 'chalk';

/**
 * Help command handler
 * Shows detailed help for specific commands
 */
export function help(): void {
  console.log(chalk.blue('Pincast CLI Help'));
  console.log('\nAvailable commands:');
  
  // Login command
  console.log(`\n${chalk.bold('pincast login')}`);
  console.log('  Authenticate with Pincast using device flow');
  console.log('  Saves credentials to ~/.pincast/config.json');
  
  // Logout command
  console.log(`\n${chalk.bold('pincast logout')}`);
  console.log('  Log out from Pincast by clearing stored credentials');
  
  // Init command
  console.log(`\n${chalk.bold('pincast init')}`);
  console.log('  Initialize a new Pincast project or add to existing Nuxt project');
  console.log('  If run in an empty directory: clones starter template');
  console.log('  If run in existing Nuxt project: adds Pincast SDK and config');
  
  // Dev command
  console.log(`\n${chalk.bold('pincast dev')}`);
  console.log('  Start local development server with API proxy');
  console.log('  Proxies API requests to local in-memory store at http://localhost:8787');
  console.log('  Runs pnpm dev in background and watches SDK requests');
  
  // Deploy command
  console.log(`\n${chalk.bold('pincast deploy [--prod]')}`);
  console.log('  Deploy your Pincast application to the Expo review queue');
  console.log('  Options:');
  console.log('    --prod    Deploy to production');
  
  console.log('\nFor more information, visit: https://docs.pincast.fm/cli');
}
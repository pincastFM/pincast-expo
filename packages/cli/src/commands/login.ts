import chalk from 'chalk';
import { startDeviceFlow } from '../deviceFlow';
import { saveAuthTokens, isAuthenticated, getConfig } from '../config';

/**
 * Login command handler
 * Authenticates the user with Logto using device flow
 */
export async function login(): Promise<void> {
  console.log(chalk.blue('Pincast Authentication'));
  console.log('Starting login flow...');
  
  // Check if already authenticated
  if (isAuthenticated()) {
    const config = getConfig();
    const userId = config.get('userId');
    const expiresAt = config.get('expiresAt') || 0;
    const expiryDate = new Date(expiresAt);
    
    console.log(chalk.yellow('You are already logged in.'));
    console.log(`Developer ID: ${userId}`);
    console.log(`Token expires: ${expiryDate.toLocaleString()}`);
    
    console.log('\nTo log out and re-authenticate, use:');
    console.log(chalk.cyan('pincast logout'));
    
    return;
  }
  
  try {
    // Start device flow auth
    const tokens = await startDeviceFlow();
    
    // Save tokens to config
    saveAuthTokens(tokens);
    
    console.log(chalk.green('\nAuthentication successful!'));
    console.log(`Developer ID: ${tokens.userId}`);
    console.log(`Token expires: ${new Date(tokens.expiresAt).toLocaleString()}`);
    
    console.log('\nYou can now use other Pincast CLI commands.');
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Authentication failed: ${error.message}`));
    } else {
      console.error(chalk.red('Authentication failed with an unknown error'));
    }
    process.exit(1);
  }
}
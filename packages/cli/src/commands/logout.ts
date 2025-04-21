import chalk from 'chalk';
import { clearAuthTokens, getConfig } from '../config';

/**
 * Logout command handler
 * Logs out the user by clearing stored authentication tokens
 */
export async function logout(): Promise<void> {
  console.log(chalk.blue('Pincast Logout'));
  
  const config = getConfig();
  const userId = config.get('userId');
  
  if (!userId) {
    console.log(chalk.yellow('You are not currently logged in.'));
    return;
  }
  
  // Clear authentication tokens
  clearAuthTokens();
  
  console.log(chalk.green('Successfully logged out.'));
  console.log('To log in again, use:');
  console.log(chalk.cyan('pincast login'));
}
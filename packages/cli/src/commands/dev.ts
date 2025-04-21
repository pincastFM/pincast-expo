import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import spawn from 'cross-spawn';
import { createProxyServer } from '../proxy/server';
import { getProjectConfig } from '../config';

// Constants
const PROXY_PORT = 8787;

/**
 * Check if current directory is a Pincast project
 */
function isPincastProject(): boolean {
  return fs.existsSync(path.join(process.cwd(), 'pincast.json'));
}

/**
 * Detect package manager (npm, yarn, pnpm)
 */
function detectPackageManager(): string {
  if (fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) {
    return 'pnpm';
  } else if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  } else {
    return 'npm';
  }
}

/**
 * Get dev command based on package manager
 */
function getDevCommand(packageManager: string): { command: string; args: string[] } {
  switch (packageManager) {
    case 'pnpm':
      return { command: 'pnpm', args: ['dev'] };
    case 'yarn':
      return { command: 'yarn', args: ['dev'] };
    default:
      return { command: 'npm', args: ['run', 'dev'] };
  }
}

/**
 * Start development server
 */
export async function dev(): Promise<void> {
  console.log(chalk.blue('Starting Pincast development server...'));
  
  // Check if inside a Pincast project
  if (!isPincastProject()) {
    console.error(chalk.red('Not a Pincast project.'));
    console.error('Run this command inside a Pincast project or initialize one with:');
    console.error(chalk.cyan('pincast init'));
    process.exit(1);
  }
  
  // Get project config
  const projectConfig = getProjectConfig();
  if (!projectConfig) {
    console.error(chalk.red('Invalid or missing pincast.json configuration.'));
    console.error('Run `pincast init` to generate a valid configuration.');
    process.exit(1);
  }
  
  console.log(`Project: ${chalk.green(projectConfig.title)}`);
  
  try {
    // Start proxy server
    console.log(`Starting API proxy on port ${PROXY_PORT}...`);
    const proxyServer = createProxyServer(PROXY_PORT);
    
    // Detect package manager
    const packageManager = detectPackageManager();
    const devCommand = getDevCommand(packageManager);
    
    console.log(`Starting development server with ${packageManager}...`);
    
    // Start development server as child process
    const child = spawn(devCommand.command, devCommand.args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PINCAST_API_URL: `http://localhost:${PROXY_PORT}`
      }
    });
    
    // Handle exit
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nShutting down...'));
      child.kill('SIGINT');
      proxyServer.close();
      process.exit(0);
    });
    
    // Handle errors
    child.on('error', (error) => {
      console.error(chalk.red(`Failed to start development server: ${error.message}`));
      proxyServer.close();
      process.exit(1);
    });
    
    // Handle exit
    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(chalk.red(`Development server exited with code ${code}`));
      }
      proxyServer.close();
      process.exit(code || 0);
    });
    
    console.log(chalk.green('\nDevelopment server started!'));
    console.log(`API proxy running at ${chalk.cyan(`http://localhost:${PROXY_PORT}`)}`);
    console.log('Press Ctrl+C to stop');
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Failed to start development server: ${error.message}`));
    } else {
      console.error(chalk.red('Failed to start development server with an unknown error'));
    }
    process.exit(1);
  }
}
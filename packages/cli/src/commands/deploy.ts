import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import ora from 'ora';
import { PincastApi, AppCreateRequest } from '../api';
import { getProjectConfig, isAuthenticated } from '../config';

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
 * Get build command based on package manager
 */
function getBuildCommand(packageManager: string): { command: string; args: string[] } {
  switch (packageManager) {
    case 'pnpm':
      return { command: 'pnpm', args: ['build'] };
    case 'yarn':
      return { command: 'yarn', args: ['build'] };
    default:
      return { command: 'npm', args: ['run', 'build'] };
  }
}

/**
 * Run the build process
 */
async function runBuild(): Promise<boolean> {
  try {
    const packageManager = detectPackageManager();
    const buildCommand = getBuildCommand(packageManager);
    
    const spinner = ora('Building project...').start();
    
    execSync(`${buildCommand.command} ${buildCommand.args.join(' ')}`, {
      stdio: ['ignore', 'ignore', 'pipe'] // Only pipe stderr to catch errors
    });
    
    spinner.succeed('Build successful');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Build failed: ${error.message}`));
    } else {
      console.error(chalk.red('Build failed with an unknown error'));
    }
    return false;
  }
}

/**
 * Deploy to Vercel (stubbed for now)
 */
async function deployToVercel(isProd: boolean): Promise<string> {
  // This is stubbed for now - will be implemented in a later ticket
  console.log(chalk.yellow('TODO: Implement Vercel deployment'));
  
  // Return a fake URL for now
  const deployId = Math.random().toString(36).substring(2, 10);
  const environment = isProd ? 'production' : 'preview';
  return `https://${environment}-${deployId}.pincast-apps.vercel.app`;
}

/**
 * Copy contents to clipboard (platform-specific)
 */
function copyToClipboard(text: string): void {
  try {
    if (process.platform === 'darwin') {
      // macOS
      execSync('pbcopy', { input: text });
    } else if (process.platform === 'win32') {
      // Windows
      execSync(`echo ${text.replace(/[&\\^|]/g, '^$&')} | clip`);
    } else {
      // Linux with xclip or xsel
      try {
        execSync('xclip -selection clipboard', { input: text });
      } catch (error) {
        try {
          execSync('xsel --clipboard --input', { input: text });
        } catch (error) {
          // Silently fail if no clipboard command is available
        }
      }
    }
  } catch (error) {
    // Silently fail if clipboard operations fail
  }
}

/**
 * Deploy command handler
 * Builds and deploys the Pincast application
 */
export async function deploy(isProd: boolean): Promise<void> {
  console.log(chalk.blue(`Deploying Pincast application to ${isProd ? 'production' : 'preview'}...`));
  
  // Check if inside a Pincast project
  if (!isPincastProject()) {
    console.error(chalk.red('Not a Pincast project.'));
    console.error('Run this command inside a Pincast project or initialize one with:');
    console.error(chalk.cyan('pincast init'));
    process.exit(1);
  }
  
  // Check if authenticated
  if (!isAuthenticated()) {
    console.error(chalk.red('Authentication required for deployment.'));
    console.error('Please run:');
    console.error(chalk.cyan('pincast login'));
    process.exit(1);
  }
  
  // Get project config
  const projectConfig = getProjectConfig();
  if (!projectConfig || !projectConfig.title || !projectConfig.slug) {
    console.error(chalk.red('Invalid or missing pincast.json configuration.'));
    console.error('Make sure your project has a valid configuration with title and slug.');
    process.exit(1);
  }
  
  console.log(`Project: ${chalk.green(projectConfig.title)}`);
  
  try {
    // Run build
    const buildSuccess = await runBuild();
    if (!buildSuccess) {
      console.error(chalk.red('Deployment cancelled due to build failure.'));
      process.exit(1);
    }
    
    // Check if .output directory exists
    const outputDir = path.join(process.cwd(), '.output');
    if (!fs.existsSync(outputDir)) {
      console.error(chalk.red('Build output directory not found.'));
      console.error('Expected to find .output/ directory after build.');
      process.exit(1);
    }
    
    // Deploy to Vercel
    const spinner = ora('Deploying to Vercel...').start();
    const deployUrl = await deployToVercel(isProd);
    spinner.succeed('Deployed to Vercel');
    
    // Create app in Pincast CI
    const api = new PincastApi();
    
    spinner.start('Registering with Pincast Expo...');
    
    const appRequest: AppCreateRequest = {
      title: projectConfig.title,
      slug: projectConfig.slug,
      buildUrl: deployUrl,
      description: projectConfig.description,
      geo: projectConfig.geo,
      heroUrl: projectConfig.heroUrl
    };
    
    const appResponse = await api.createApp(appRequest);
    
    spinner.succeed('Registered with Pincast Expo');
    
    console.log(chalk.green('\nDeployment successful!'));
    console.log(`Build URL: ${chalk.cyan(deployUrl)}`);
    console.log(`App ID: ${chalk.cyan(appResponse.appId)}`);
    console.log(`Version ID: ${chalk.cyan(appResponse.versionId)}`);
    console.log(`Dashboard: ${chalk.cyan(appResponse.dashboard)}`);
    console.log(`Status: ${chalk.yellow(appResponse.status)}`);
    
    // Copy dashboard URL to clipboard
    copyToClipboard(appResponse.dashboard);
    console.log(chalk.gray('Dashboard URL copied to clipboard'));
    
    if (appResponse.status === 'pending') {
      console.log(chalk.yellow('\nYour app is pending review.'));
      console.log('Check the dashboard for updates on your app status.');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Deployment failed: ${error.message}`));
    } else {
      console.error(chalk.red('Deployment failed with an unknown error'));
    }
    process.exit(1);
  }
}
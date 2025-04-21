import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { execSync } from 'child_process';
import { saveProjectConfig, isAuthenticated } from '../config';

/**
 * Check if a directory is empty
 */
function isDirectoryEmpty(dir: string): boolean {
  const files = fs.readdirSync(dir);
  return files.length === 0;
}

/**
 * Check if we're in a Nuxt project
 */
function isNuxtProject(): boolean {
  try {
    // Check if package.json exists and contains nuxt dependency
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJSONSync(packageJsonPath);
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      return 'nuxt' in deps;
    }
  } catch (error) {
    // Ignore errors
  }
  
  return false;
}

/**
 * Clone starter template
 */
async function cloneStarterTemplate(): Promise<boolean> {
  try {
    console.log(chalk.blue('Cloning Pincast starter template...'));
    
    execSync('git clone --depth 1 https://github.com/pincast/create-pincast-app .', {
      stdio: 'inherit'
    });
    
    console.log(chalk.green('Starter template cloned successfully!'));
    
    return true;
  } catch (error) {
    console.error(chalk.red('Failed to clone starter template.'));
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Add Pincast SDK to existing Nuxt project
 */
async function addSdkToNuxtProject(): Promise<boolean> {
  try {
    console.log(chalk.blue('Adding Pincast SDK to Nuxt project...'));
    
    // Check if using npm, yarn, or pnpm
    let packageManager = 'npm';
    if (fs.existsSync('pnpm-lock.yaml')) {
      packageManager = 'pnpm';
    } else if (fs.existsSync('yarn.lock')) {
      packageManager = 'yarn';
    }
    
    // Install packages
    if (packageManager === 'pnpm') {
      execSync('pnpm add @pincast/sdk pinia @pinia/nuxt', { stdio: 'inherit' });
    } else if (packageManager === 'yarn') {
      execSync('yarn add @pincast/sdk pinia @pinia/nuxt', { stdio: 'inherit' });
    } else {
      execSync('npm install @pincast/sdk pinia @pinia/nuxt', { stdio: 'inherit' });
    }
    
    console.log(chalk.green('Packages installed successfully!'));
    
    // Update nuxt.config.ts
    const nuxtConfigPath = fs.existsSync('nuxt.config.ts') 
      ? 'nuxt.config.ts' 
      : 'nuxt.config.js';
    
    if (fs.existsSync(nuxtConfigPath)) {
      let nuxtConfig = fs.readFileSync(nuxtConfigPath, 'utf-8');
      
      // Add @pincast/sdk to modules if not already present
      if (!nuxtConfig.includes('@pincast/sdk')) {
        nuxtConfig = nuxtConfig.replace(
          /modules:\s*\[([^\]]*)\]/s,
          (match, modules) => {
            return `modules: [${modules}${modules.trim().endsWith(',') ? '' : ','}\n    '@pincast/sdk'\n  ]`;
          }
        );
        
        fs.writeFileSync(nuxtConfigPath, nuxtConfig);
        console.log(chalk.green('Added @pincast/sdk to nuxt.config.ts modules array'));
      }
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('Failed to add SDK to Nuxt project.'));
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Create pincast.json config file
 */
async function createPincastConfig(): Promise<boolean> {
  try {
    console.log(chalk.blue('Creating Pincast configuration...'));
    
    const response = await prompts([
      {
        type: 'text',
        name: 'title',
        message: 'Project title:',
        initial: path.basename(process.cwd())
      },
      {
        type: 'text',
        name: 'slug',
        message: 'Project slug (URL-friendly name):',
        initial: path.basename(process.cwd()).toLowerCase().replace(/[^a-z0-9]/g, '-')
      },
      {
        type: 'text',
        name: 'latitude',
        message: 'Default latitude:',
        initial: '37.7749',
        validate: value => !isNaN(parseFloat(value)) ? true : 'Please enter a valid number'
      },
      {
        type: 'text',
        name: 'longitude',
        message: 'Default longitude:',
        initial: '-122.4194',
        validate: value => !isNaN(parseFloat(value)) ? true : 'Please enter a valid number'
      },
      {
        type: 'text',
        name: 'radius',
        message: 'Default radius (meters):',
        initial: '1000',
        validate: value => !isNaN(parseInt(value)) ? true : 'Please enter a valid number'
      }
    ]);
    
    // Check if user cancelled
    if (!response.title || !response.slug) {
      console.error(chalk.red('Configuration cancelled.'));
      return false;
    }
    
    // Create config
    const config = {
      title: response.title,
      slug: response.slug,
      geo: {
        center: [parseFloat(response.longitude), parseFloat(response.latitude)],
        radiusMeters: parseInt(response.radius)
      }
    };
    
    // Save config
    saveProjectConfig(config);
    
    console.log(chalk.green('pincast.json created successfully!'));
    
    return true;
  } catch (error) {
    console.error(chalk.red('Failed to create configuration.'));
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Create .env.pincast file
 */
async function createEnvFile(): Promise<boolean> {
  try {
    // Skip env file creation for now - we'll retrieve actual client credentials later
    const envContent = `# Pincast Environment Configuration
PINCAST_API_URL=http://localhost:8787
# Retrieved Logto client credentials
LOGTO_ENDPOINT=https://auth.pincast.fm
LOGTO_APP_ID=pincast-expo-app
LOGTO_APP_SECRET=placeholder
`;
    
    fs.writeFileSync('.env.pincast', envContent);
    console.log(chalk.green('.env.pincast created successfully!'));
    
    return true;
  } catch (error) {
    console.error(chalk.red('Failed to create .env.pincast file.'));
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Init command handler
 * Initializes a new Pincast project or adds Pincast to existing Nuxt project
 */
export async function init(): Promise<void> {
  console.log(chalk.blue('Pincast Project Initialization'));
  
  // Check if authenticated
  if (!isAuthenticated()) {
    console.log(chalk.yellow('You are not logged in. Authentication is recommended.'));
    console.log('Run `pincast login` first, or continue without authentication.');
    
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: 'Continue without authentication?',
      initial: false
    });
    
    if (!proceed) {
      console.log('Initialization cancelled. Please run `pincast login` first.');
      return;
    }
  }
  
  // Check current directory
  const currentDir = process.cwd();
  
  // If directory is empty, clone starter template
  if (isDirectoryEmpty(currentDir)) {
    const cloneSuccess = await cloneStarterTemplate();
    if (!cloneSuccess) {
      console.error(chalk.red('Failed to initialize project.'));
      process.exit(1);
    }
  } 
  // If directory is a Nuxt project, add SDK
  else if (isNuxtProject()) {
    console.log(chalk.blue('Detected existing Nuxt project.'));
    
    // Add SDK
    const addSuccess = await addSdkToNuxtProject();
    if (!addSuccess) {
      console.error(chalk.red('Failed to add SDK to project.'));
      process.exit(1);
    }
  } 
  // If directory is not empty and not a Nuxt project, exit
  else {
    console.error(chalk.red('Current directory is not empty and not a Nuxt project.'));
    console.error('Please run this command in an empty directory or a Nuxt project.');
    process.exit(1);
  }
  
  // Create pincast.json
  const configSuccess = await createPincastConfig();
  if (!configSuccess) {
    console.error(chalk.red('Failed to create configuration.'));
    process.exit(1);
  }
  
  // Create .env.pincast
  const envSuccess = await createEnvFile();
  if (!envSuccess) {
    console.error(chalk.red('Failed to create environment file.'));
    process.exit(1);
  }
  
  console.log(chalk.green('\nPincast project initialized successfully!'));
  console.log('To start development server, run:');
  console.log(chalk.cyan('pincast dev'));
}
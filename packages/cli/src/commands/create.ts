import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { execSync } from 'child_process';
import spawn from 'cross-spawn';
import { saveProjectConfig, isAuthenticated } from '../config';

/**
 * Check if a directory exists and is empty
 */
function validateTargetDirectory(dir: string): { valid: boolean; message: string } {
  // Check if directory exists
  if (fs.existsSync(dir)) {
    // Check if it's empty
    const files = fs.readdirSync(dir);
    if (files.length > 0) {
      return { 
        valid: false, 
        message: `Directory "${dir}" already exists and is not empty.` 
      };
    }
  }
  
  return { valid: true, message: '' };
}

/**
 * Create a new directory if it doesn't exist
 */
function createDirectory(dir: string): boolean {
  try {
    fs.ensureDirSync(dir);
    return true;
  } catch (error) {
    console.error(chalk.red(`Failed to create directory: ${dir}`));
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Copy the template files to the target directory
 */
async function copyTemplate(targetDir: string): Promise<boolean> {
  try {
    console.log(chalk.blue('Creating Pincast starter app...'));
    
    // Get the template directory path
    const templateDir = path.resolve(
      __dirname, 
      '../../templates/starter'
    );
    
    // Copy template files to target directory
    fs.copySync(templateDir, targetDir, { overwrite: true });
    
    console.log(chalk.green('Template files copied successfully!'));
    return true;
  } catch (error) {
    console.error(chalk.red('Failed to copy template files.'));
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Update package.json with project name and other details
 */
async function updatePackageJson(targetDir: string, projectName: string): Promise<boolean> {
  try {
    const packageJsonPath = path.join(targetDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJSONSync(packageJsonPath);
      
      // Update package name and reset version
      packageJson.name = projectName.toLowerCase().replace(/\s+/g, '-');
      packageJson.version = '0.1.0';
      packageJson.private = true;
      
      // Remove template-specific fields if any
      delete packageJson.repository;
      delete packageJson.author;
      
      // Write updated package.json
      fs.writeJSONSync(packageJsonPath, packageJson, { spaces: 2 });
      
      console.log(chalk.green('Updated package.json'));
      return true;
    } else {
      console.error(chalk.red('package.json not found in template.'));
      return false;
    }
  } catch (error) {
    console.error(chalk.red('Failed to update package.json.'));
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Create pincast.json configuration file
 */
async function createPincastConfig(targetDir: string, projectName: string): Promise<boolean> {
  try {
    console.log(chalk.blue('Creating Pincast configuration...'));
    
    const response = await prompts([
      {
        type: 'text',
        name: 'title',
        message: 'Project title:',
        initial: projectName
      },
      {
        type: 'text',
        name: 'slug',
        message: 'Project slug (URL-friendly name):',
        initial: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      },
      {
        type: 'text',
        name: 'latitude',
        message: 'Default latitude:',
        initial: '37.7749', // San Francisco default
        validate: value => !isNaN(parseFloat(value)) ? true : 'Please enter a valid number'
      },
      {
        type: 'text',
        name: 'longitude',
        message: 'Default longitude:',
        initial: '-122.4194', // San Francisco default
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
    
    // Save config to the target directory
    fs.writeJSONSync(path.join(targetDir, 'pincast.json'), config, { spaces: 2 });
    
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
 * Create environment file
 */
async function createEnvFile(targetDir: string): Promise<boolean> {
  try {
    const envContent = `# Pincast Environment Configuration
PINCAST_API_URL=http://localhost:8787

# Logto Authentication
LOGTO_ENDPOINT=https://auth.pincast.fm
LOGTO_APP_ID=pincast-expo-app
LOGTO_APP_SECRET=placeholder

# Mapbox Configuration
MAPBOX_ACCESS_TOKEN=pk.placeholder
`;
    
    fs.writeFileSync(path.join(targetDir, '.env'), envContent);
    console.log(chalk.green('.env file created successfully!'));
    
    return true;
  } catch (error) {
    console.error(chalk.red('Failed to create .env file.'));
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Install dependencies using the appropriate package manager
 */
async function installDependencies(targetDir: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(chalk.blue('Installing dependencies...'));
    
    // Choose package manager based on the current environment
    // Use pnpm if available (since the main project uses pnpm)
    const useYarn = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
    const usePnpm = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));
    
    const command = usePnpm ? 'pnpm' : useYarn ? 'yarn' : 'npm';
    const args = usePnpm ? ['install'] : useYarn ? ['install'] : ['install'];
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: targetDir
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`Failed to install dependencies with ${command}.`));
        console.log(chalk.yellow('You can install them manually later.'));
        resolve(false);
      } else {
        console.log(chalk.green('Dependencies installed successfully!'));
        resolve(true);
      }
    });
  });
}

/**
 * Initialize a new git repository
 */
async function initGitRepository(targetDir: string): Promise<boolean> {
  try {
    console.log(chalk.blue('Initializing git repository...'));
    
    execSync('git init', {
      stdio: 'inherit',
      cwd: targetDir
    });
    
    execSync('git add .', {
      stdio: 'inherit',
      cwd: targetDir
    });
    
    execSync('git commit -m "Initial commit from Pincast create command"', {
      stdio: 'inherit',
      cwd: targetDir
    });
    
    console.log(chalk.green('Git repository initialized!'));
    return true;
  } catch (error) {
    console.error(chalk.red('Failed to initialize git repository.'));
    if (error instanceof Error) {
      console.error(error.message);
    }
    console.log(chalk.yellow('You can initialize git manually later.'));
    return false;
  }
}

/**
 * Create command handler
 * Creates a new Pincast application from the starter template
 */
export async function create(projectDir?: string): Promise<void> {
  console.log(chalk.blue('Pincast Starter App Creation'));
  
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
      console.log('App creation cancelled. Please run `pincast login` first.');
      return;
    }
  }
  
  // Prompt for project directory if not provided
  let targetDir = projectDir;
  if (!targetDir) {
    const response = await prompts({
      type: 'text',
      name: 'dir',
      message: 'Project directory:',
      initial: 'my-pincast-app'
    });
    
    if (!response.dir) {
      console.error(chalk.red('App creation cancelled.'));
      return;
    }
    
    targetDir = response.dir;
  }
  
  // Validate target directory
  const { valid, message } = validateTargetDirectory(targetDir);
  if (!valid) {
    console.error(chalk.red(message));
    console.error('Please choose a different directory or remove the contents first.');
    process.exit(1);
  }
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    const dirCreated = createDirectory(targetDir);
    if (!dirCreated) {
      console.error(chalk.red('Failed to create project directory.'));
      process.exit(1);
    }
  }
  
  // Get absolute path of target directory
  const targetAbsPath = path.resolve(process.cwd(), targetDir);
  
  // Extract project name from directory
  const projectName = path.basename(targetAbsPath);
  
  // Copy template files
  const templateCopied = await copyTemplate(targetAbsPath);
  if (!templateCopied) {
    console.error(chalk.red('Failed to create starter app.'));
    process.exit(1);
  }
  
  // Update package.json
  const packageUpdated = await updatePackageJson(targetAbsPath, projectName);
  if (!packageUpdated) {
    console.error(chalk.red('Failed to update package.json.'));
    process.exit(1);
  }
  
  // Create pincast.json
  const configCreated = await createPincastConfig(targetAbsPath, projectName);
  if (!configCreated) {
    console.error(chalk.red('Failed to create pincast.json.'));
    process.exit(1);
  }
  
  // Create .env file
  const envCreated = await createEnvFile(targetAbsPath);
  if (!envCreated) {
    console.error(chalk.red('Failed to create .env file.'));
    process.exit(1);
  }
  
  // Install dependencies
  await installDependencies(targetAbsPath);
  
  // Initialize git repository
  await initGitRepository(targetAbsPath);
  
  console.log(chalk.green('\nPincast starter app created successfully! 🎉'));
  console.log(`\nCreated ${projectName} in ${chalk.cyan(targetAbsPath)}`);
  console.log('\nNext steps:');
  console.log(`  ${chalk.cyan('cd')} ${targetDir}`);
  console.log(`  ${chalk.cyan('pincast dev')}     Start the development server`);
  console.log(`  ${chalk.cyan('pincast deploy')}  Deploy your application`);
}
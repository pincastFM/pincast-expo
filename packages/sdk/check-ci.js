// Diagnostic script to check CI environment
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('===== CI Environment Diagnostics =====');
console.log('Current directory:', process.cwd());

// Check if current directory is a symlink
try {
  const stats = fs.lstatSync('.');
  console.log('Current directory is symlink:', stats.isSymbolicLink());
  if (stats.isSymbolicLink()) {
    console.log('Symlink points to:', fs.readlinkSync('.'));
  }
} catch (err) {
  console.error('Error checking if current directory is symlink:', err);
}

// Check if src directory is a symlink
try {
  if (fs.existsSync('./src')) {
    const stats = fs.lstatSync('./src');
    console.log('src directory is symlink:', stats.isSymbolicLink());
    if (stats.isSymbolicLink()) {
      console.log('Symlink points to:', fs.readlinkSync('./src'));
    }
  } else {
    console.log('src directory does not exist in current working directory');
  }
} catch (err) {
  console.error('Error checking if src directory is symlink:', err);
}

// List all directories in current directory
console.log('\nDirectories in current directory:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    try {
      const stats = fs.statSync(file);
      if (stats.isDirectory()) {
        console.log(` - ${file}/ (is symlink: ${fs.lstatSync(file).isSymbolicLink()})`);
        
        // Check if this directory is a pnpm virtual store path
        if (file === 'node_modules') {
          try {
            const nmContent = fs.readdirSync(file);
            const hasDotPnpm = nmContent.includes('.pnpm');
            console.log(`   - Contains .pnpm: ${hasDotPnpm}`);
            if (hasDotPnpm) {
              const pnpmStorePath = path.join(file, '.pnpm');
              const pnpmContent = fs.readdirSync(pnpmStorePath);
              console.log(`   - .pnpm contents sample: ${pnpmContent.slice(0, 3).join(', ')}...`);
            }
          } catch (e) {
            console.log(`   - Error reading node_modules: ${e.message}`);
          }
        }
      }
    } catch (err) {
      console.log(` - ${file} (error: ${err.message})`);
    }
  });
} catch (err) {
  console.error('Error listing directories:', err);
}

// Check pnpm workspace structure
console.log('\nChecking pnpm workspace structure:');
try {
  const pnpmOutput = execSync('pnpm list -r').toString();
  console.log(pnpmOutput);
} catch (err) {
  console.error('Error running pnpm list:', err);
}

// Check if src files exist relative to project root
console.log('\nChecking file existence from different relative paths:');
const filesToCheck = [
  './src/index.ts',
  '../src/index.ts',
  '../../src/index.ts',
  './packages/sdk/src/index.ts',
  '/home/runner/work/pincast-expo/pincast-expo/packages/sdk/src/index.ts'
];

filesToCheck.forEach(file => {
  console.log(`${file} exists:`, fs.existsSync(file));
});

// Attempt to determine absolute path to src directory
console.log('\nAttempting to find absolute path to src directory:');
try {
  const findOutput = execSync('find /home/runner/work -name "index.ts" | grep -E "/src/index.ts$" | sort').toString();
  console.log('Found index.ts files:');
  console.log(findOutput);
} catch (err) {
  console.error('Error finding index.ts files:', err.message);
}

// Check for empty directory
console.log('\nChecking if src directory is empty:');
try {
  if (fs.existsSync('./src')) {
    const srcContents = fs.readdirSync('./src');
    console.log('Contents of ./src:', srcContents);
    console.log('Number of files/dirs in ./src:', srcContents.length);
  } else {
    console.log('./src does not exist');
  }
} catch (err) {
  console.error('Error checking src contents:', err);
}

// Try to use glob patterns directly to find files
console.log('\nAttempting to use glob patterns to find files:');
try {
  const globOutput = execSync('find . -type f -name "*.ts" | grep -v "node_modules" | sort').toString();
  console.log('TypeScript files in the current directory tree:');
  console.log(globOutput);
} catch (err) {
  console.error('Error using glob to find files:', err.message);
}

// Print information about the TypeScript compiler
console.log('\nTypeScript compiler information:');
try {
  const tscVersion = execSync('tsc --version').toString();
  console.log('tsc version:', tscVersion);
  
  const npmList = execSync('npm list typescript -g').toString();
  console.log('Global TypeScript installation:');
  console.log(npmList);
} catch (err) {
  console.error('Error getting TypeScript information:', err.message);
}

// Print tsconfig.build.json content
console.log('\ntsconfig.build.json content:');
try {
  if (fs.existsSync('./tsconfig.build.json')) {
    const tsconfig = fs.readFileSync('./tsconfig.build.json', 'utf8');
    console.log(tsconfig);
  } else {
    console.log('tsconfig.build.json does not exist');
  }
} catch (err) {
  console.error('Error reading tsconfig.build.json:', err);
}
/**
 * Custom build script for the SDK package to handle each entry file separately
 * This script is used as a fallback in case direct tsup calls fail in CI
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Entry files to build
const entryFiles = [
  'src/index.ts',
  'src/module.ts',
  'src/runtime/plugin.ts'
];

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync('dist')) {
  try {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✅ Dist directory cleaned');
  } catch (err) {
    console.error('❌ Failed to clean dist directory:', err);
  }
}

// Check that all entry files exist
console.log('\nVerifying entry files:');
entryFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${file}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  
  if (!exists) {
    // Try to list the directory to help diagnose the issue
    try {
      const dir = path.dirname(file);
      console.log(`Contents of ${dir}:`, fs.readdirSync(dir));
    } catch (err) {
      console.error(`Cannot list directory ${path.dirname(file)}:`, err);
    }
  }
});

// Log the current working directory for debugging
console.log('\nCurrent working directory:', process.cwd());
console.log('Directory contents:', fs.readdirSync('.'));

// Build each entry file separately
console.log('\nBuilding entry files:');
let success = true;

for (const entryFile of entryFiles) {
  console.log(`\nBuilding ${entryFile}...`);
  
  try {
    // Get the absolute path to tsup
    const tsupPath = path.resolve('./node_modules/.bin/tsup');
    console.log(`Using tsup at: ${tsupPath}`);
    
    // Use the absolute path to tsup to avoid PATH issues
    const command = `"${tsupPath}" ${entryFile} --dts --format cjs,esm --clean=false --sourcemap`;
    console.log(`Running: ${command}`);
    
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Successfully built ${entryFile}`);
  } catch (err) {
    console.error(`❌ Failed to build ${entryFile}:`, err);
    success = false;
  }
}

if (success) {
  console.log('\n✅ All files built successfully');
  process.exit(0);
} else {
  console.error('\n❌ Some files failed to build');
  process.exit(1);
}
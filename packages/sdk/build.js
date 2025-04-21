#!/usr/bin/env node

// A simple script to run tsup with individual arguments
// This avoids any potential issues with argument parsing

const { spawn } = require('child_process');

// Define the entry files separately to ensure they're passed as individual arguments
const entryFiles = [
  'src/index.ts',
  'src/module.ts',
  'src/runtime/plugin.ts'
];

// Build the command arguments
const args = [
  ...entryFiles,
  '--dts',
  '--format', 'cjs,esm',
  '--clean'
];

// Run tsup with the arguments
console.log(`Running: tsup ${args.join(' ')}`);
const process = spawn('tsup', args, { stdio: 'inherit' });

process.on('close', (code) => {
  console.log(`tsup exited with code ${code}`);
  process.exit(code);
});
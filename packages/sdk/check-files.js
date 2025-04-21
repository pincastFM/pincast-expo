import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// List all files in src directory recursively
function listFilesRecursive(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      listFilesRecursive(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

try {
  console.log('Checking if src directory exists:', fs.existsSync('./src'));
  console.log('Checking if specific files exist:');
  console.log('- src/index.ts exists:', fs.existsSync('./src/index.ts'));
  console.log('- src/module.ts exists:', fs.existsSync('./src/module.ts'));
  console.log('- src/runtime/plugin.ts exists:', fs.existsSync('./src/runtime/plugin.ts'));
  
  console.log('\nSrc directory contents:');
  try {
    const allFiles = listFilesRecursive('./src');
    allFiles.forEach(file => console.log(file));
    console.log(`\nTotal files in src: ${allFiles.length}`);
  } catch (err) {
    console.error('Error listing src directory:', err);
  }
  
  console.log('\ntsconfig.build.json contents:');
  console.log(fs.readFileSync('./tsconfig.build.json', 'utf8'));

  // Check if any of the source files are symlinks
  console.log('\nChecking for symlinks:');
  const srcStat = fs.lstatSync('./src');
  console.log('src/ is symlink:', srcStat.isSymbolicLink());
  
  if (fs.existsSync('./src/index.ts')) {
    const indexStat = fs.lstatSync('./src/index.ts');
    console.log('src/index.ts is symlink:', indexStat.isSymbolicLink());
  }
  
  // Try absolute paths
  const absoluteSrcPath = path.resolve('./src');
  console.log('\nAbsolute src path:', absoluteSrcPath);
  console.log('Absolute src path exists:', fs.existsSync(absoluteSrcPath));
} catch (err) {
  console.error('Error checking files:', err);
}
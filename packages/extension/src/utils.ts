import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

/**
 * Check if Pincast SDK is enabled in the workspace
 */
export async function checkPincastEnabled(workspaceFolderUri: vscode.Uri): Promise<boolean> {
  try {
    // Check for package.json with @pincast/sdk dependency
    const packageJsonUri = vscode.Uri.joinPath(workspaceFolderUri, 'package.json');
    const packageJsonExists = await checkFileExists(packageJsonUri);
    
    if (packageJsonExists) {
      const content = await fs.readFile(packageJsonUri.fsPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      
      if (dependencies['@pincast/sdk'] || devDependencies['@pincast/sdk']) {
        return true;
      }
    }
    
    // Check for pincast.json (which is created during pincast init)
    const pincastJsonUri = vscode.Uri.joinPath(workspaceFolderUri, 'pincast.json');
    const pincastJsonExists = await checkFileExists(pincastJsonUri);
    
    return pincastJsonExists;
  } catch (error) {
    console.error('Error checking if Pincast is enabled:', error);
    return false;
  }
}

/**
 * Check if the user is logged in to Pincast
 */
export async function checkUserLoggedIn(): Promise<boolean> {
  try {
    const configPath = path.join(os.homedir(), '.pincast/config.json');
    
    if (await fs.pathExists(configPath)) {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      // Check if token exists and is not expired
      if (config.devToken && config.expiresAt) {
        const expiresAt = config.expiresAt;
        if (expiresAt > Date.now()) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if user is logged in:', error);
    return false;
  }
}

/**
 * Helper function to check if a file exists
 */
async function checkFileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}
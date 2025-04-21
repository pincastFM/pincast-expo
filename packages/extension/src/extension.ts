import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as cp from 'child_process';
import { StatusBarManager } from './ui/statusBar';
import { checkPincastEnabled, checkUserLoggedIn } from './utils';
import { handleExtensionActivation } from './activate';

// Create an output channel for Pincast logs
let outputChannel: vscode.OutputChannel;
let statusBarManager: StatusBarManager;

export async function activate(context: vscode.ExtensionContext) {
  console.log('Pincast Expo extension is now active');
  
  // Initialize output channel and status bar
  outputChannel = vscode.window.createOutputChannel('Pincast');
  statusBarManager = new StatusBarManager();
  context.subscriptions.push(outputChannel, statusBarManager.statusBarItem);
  
  // Show output channel
  outputChannel.show(true);
  outputChannel.appendLine('Pincast Expo extension activated');
  
  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    outputChannel.appendLine('No workspace folder found');
    statusBarManager.updateStatus(false, 'No workspace');
    return;
  }
  
  // Check if the workspace has Pincast SDK enabled
  const hasSDK = await checkPincastEnabled(workspaceFolder.uri);
  outputChannel.appendLine(`Pincast SDK enabled: ${hasSDK}`);
  
  // Check if user is logged in
  const isLoggedIn = await checkUserLoggedIn();
  outputChannel.appendLine(`User logged in: ${isLoggedIn}`);
  
  // Update status bar
  statusBarManager.updateStatus(isLoggedIn, hasSDK ? 'SDK enabled' : 'SDK not enabled');
  
  // Register commands
  const enableCommand = vscode.commands.registerCommand('pincast.enable', enablePincast);
  const publishCommand = vscode.commands.registerCommand('pincast.publish', publishToMarketplace);
  const loginCommand = vscode.commands.registerCommand('pincast.login', login);
  const openDashboardCommand = vscode.commands.registerCommand('pincast.openDashboard', openDashboard);
  
  context.subscriptions.push(
    enableCommand,
    publishCommand,
    loginCommand,
    openDashboardCommand
  );
  
  // Handle extension installation event
  // Check if this is a new installation by looking at extension state
  const extensionId = 'pincast.pincast-expo';
  const extension = vscode.extensions.getExtension(extensionId);
  
  if (extension) {
    const extensionWasUsedBefore = context.globalState.get('extensionActivated');
    
    if (!extensionWasUsedBefore) {
      // This is a new installation, run the activation handler
      outputChannel.appendLine('First activation detected. Running installation flow.');
      
      // Set the flag to indicate this extension has been activated before
      context.globalState.update('extensionActivated', true);
      
      // Handle the activation
      await handleExtensionActivation();
    } else {
      outputChannel.appendLine('Extension was previously activated. Skipping installation flow.');
    }
  }
}

async function enablePincast() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }
  
  // Check if already enabled
  const isAlreadyEnabled = await checkPincastEnabled(workspaceFolder.uri);
  if (isAlreadyEnabled) {
    outputChannel.appendLine('Pincast SDK already enabled in workspace. Continuing anyway...');
  } else {
    outputChannel.appendLine('Enabling Pincast Expo in workspace...');
  }
  
  try {
    // Run pincast init command
    const result = await runPincastCommand(['init'], workspaceFolder.uri.fsPath);
    
    if (result.exitCode === 0) {
      // Update the status bar
      statusBarManager.updateStatus(await checkUserLoggedIn(), 'SDK enabled');
      
      // Return success so that any calling functions know it worked
      return true;
    } else {
      vscode.window.showErrorMessage('Failed to enable Pincast Expo');
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      outputChannel.appendLine(`Error: ${error.message}`);
      vscode.window.showErrorMessage(`Failed to enable Pincast: ${error.message}`);
      return false;
    }
  }
}

async function publishToMarketplace() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }
  
  // Check if user is logged in
  const isLoggedIn = await checkUserLoggedIn();
  if (!isLoggedIn) {
    const loginFirst = 'Login First';
    const response = await vscode.window.showErrorMessage(
      'You need to login to publish to Pincast Marketplace',
      loginFirst
    );
    
    if (response === loginFirst) {
      await login();
    }
    return;
  }
  
  // Check if Pincast SDK is enabled
  const hasSDK = await checkPincastEnabled(workspaceFolder.uri);
  if (!hasSDK) {
    const enableFirst = 'Enable First';
    const response = await vscode.window.showErrorMessage(
      'You need to enable Pincast Expo in your workspace before publishing',
      enableFirst
    );
    
    if (response === enableFirst) {
      await enablePincast();
    }
    return;
  }
  
  // Create a terminal to run the deploy command (better UX for long-running process)
  const terminal = vscode.window.createTerminal('Pincast Deploy');
  terminal.show();
  terminal.sendText(`cd "${workspaceFolder.uri.fsPath}" && pincast deploy`);
  
  vscode.window.showInformationMessage('Deployment started in terminal');
  
  // Add a listener for the terminal to close
  vscode.window.onDidCloseTerminal(async closedTerminal => {
    if (closedTerminal === terminal && closedTerminal.exitStatus?.code === 0) {
      // Successful deployment - check for dashboard URL in the clipboard
      const clipboardContent = await vscode.env.clipboard.readText();
      
      if (clipboardContent.includes('expo.pincast.fm/dashboard')) {
        // Allow the user to open the dashboard URL
        const openDashboard = 'Open Dashboard';
        const response = await vscode.window.showInformationMessage(
          'Deployment successful! Dashboard URL copied to clipboard.',
          openDashboard
        );
        
        if (response === openDashboard) {
          await vscode.env.openExternal(vscode.Uri.parse(clipboardContent));
        }
      }
    }
  });
}

async function login() {
  // Check if already logged in
  const isLoggedIn = await checkUserLoggedIn();
  if (isLoggedIn) {
    vscode.window.showInformationMessage('Already logged in to Pincast');
    return;
  }
  
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }
  
  // Run pincast login command
  const terminal = vscode.window.createTerminal('Pincast Login');
  terminal.show();
  terminal.sendText(`cd "${workspaceFolder.uri.fsPath}" && pincast login`);
  
  // Set up a watcher to check for login status changes
  const configPath = path.join(os.homedir(), '.pincast/config.json');
  const watcher = fs.watch(path.dirname(configPath), async () => {
    // Check if login was successful
    const isNowLoggedIn = await checkUserLoggedIn();
    if (isNowLoggedIn) {
      statusBarManager.updateStatus(true, await checkPincastEnabled(workspaceFolder.uri) ? 'SDK enabled' : 'SDK not enabled');
      vscode.window.showInformationMessage('Successfully logged in to Pincast');
      watcher.close();
    }
  });
  
  // Clean up watcher after some time (in case login doesn't happen)
  setTimeout(() => {
    watcher.close();
  }, 5 * 60 * 1000); // 5 minutes timeout
}

async function openDashboard() {
  await vscode.env.openExternal(vscode.Uri.parse('https://expo.pincast.fm/dashboard'));
}

// Helper function to run pincast CLI commands
async function runPincastCommand(args: string[], cwd: string): Promise<{ stdout: string, stderr: string, exitCode: number }> {
  return new Promise((resolve, reject) => {
    const command = 'pincast';
    outputChannel.appendLine(`Running: ${command} ${args.join(' ')}`);
    
    const proc = cp.spawn(command, args, { cwd });
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      outputChannel.append(text);
    });
    
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      outputChannel.append(text);
    });
    
    proc.on('close', (code) => {
      outputChannel.appendLine(`Exit code: ${code}`);
      resolve({
        stdout,
        stderr,
        exitCode: code !== null ? code : -1
      });
    });
    
    proc.on('error', (err) => {
      outputChannel.appendLine(`Error: ${err.message}`);
      reject(err);
    });
  });
}

export function deactivate() {
  // Clean up resources
  if (outputChannel) {
    outputChannel.dispose();
  }
}
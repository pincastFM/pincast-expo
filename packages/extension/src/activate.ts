import * as vscode from 'vscode';

/**
 * Handle the extension activation event
 * This is called when the extension is installed or updated
 */
export async function handleExtensionActivation() {
  // When the extension is installed, run pincast.enable command
  // and then show a toast message
  try {
    // Run the enable command first to set up the workspace
    await vscode.commands.executeCommand('pincast.enable');
    
    // Show a toast message with action buttons
    const openDocsButton = 'Open Docs';
    const createButton = 'Run pincast create';
    
    const choice = await vscode.window.showInformationMessage(
      'Pincast Expo enabled ✅ – run `pincast create <name>` or start vibe-prompting.',
      openDocsButton,
      createButton
    );
    
    // Handle button clicks
    if (choice === openDocsButton) {
      // Open documentation in browser
      vscode.env.openExternal(vscode.Uri.parse('https://docs.pincast.fm/getting-started'));
    } else if (choice === createButton) {
      // Prompt user for project name
      const projectName = await vscode.window.showInputBox({
        placeHolder: 'my-pincast-app',
        prompt: 'Enter a name for your Pincast project'
      });
      
      // If user provided a name, run create command in terminal
      if (projectName) {
        const terminal = vscode.window.createTerminal('Pincast Create');
        terminal.show();
        
        // Get workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
          terminal.sendText(`cd "${workspaceFolder.uri.fsPath}" && pincast create ${projectName}`);
        } else {
          terminal.sendText(`pincast create ${projectName}`);
        }
      }
    }
  } catch (error) {
    // Handle any errors that occur during activation
    console.error('Error during extension activation:', error);
  }
}
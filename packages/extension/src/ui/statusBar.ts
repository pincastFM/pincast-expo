import * as vscode from 'vscode';

export class StatusBarManager {
  statusBarItem: vscode.StatusBarItem;
  
  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = 'pincast.login';
    this.statusBarItem.show();
    
    // Set initial state
    this.updateStatus(false, 'Checking...');
  }
  
  /**
   * Update the status bar item based on login status and SDK state
   */
  updateStatus(isLoggedIn: boolean, sdkState: string): void {
    if (isLoggedIn) {
      this.statusBarItem.text = '$(check) Pincast';
      this.statusBarItem.tooltip = `Pincast: Logged in (${sdkState})`;
      this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    } else {
      this.statusBarItem.text = '$(warning) Pincast';
      this.statusBarItem.tooltip = `Pincast: Not logged in (${sdkState})`;
      this.statusBarItem.color = new vscode.ThemeColor('errorForeground');
      this.statusBarItem.backgroundColor = undefined;
    }
  }
}
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { HealthyPanel } from './webview';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	HealthyPanel.createOrShow(context.extensionUri);

	vscode.commands.registerCommand('well-being.refresh', () => {
		vscode.window.showInformationMessage(`Successfully called refresh.`);
		HealthyPanel.createOrShow(context.extensionUri);
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('well-being.healthy', () => {

		vscode.window.showInformationMessage('Hello World from well-being!!!!');

		HealthyPanel.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

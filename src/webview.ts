import * as vscode from 'vscode';
import Timer from './timer';

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class HealthyPanel {

  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: HealthyPanel | undefined;

  public static readonly viewType = 'well-being';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (HealthyPanel.currentPanel) {
      HealthyPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      HealthyPanel.viewType,
      'healthy warning',
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri),
    );

    HealthyPanel.currentPanel = new HealthyPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    HealthyPanel.currentPanel = new HealthyPanel(panel, extensionUri);
  }

  public showError(message: string) {
    vscode.window.showErrorMessage(message);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._createPanel(this._panel.webview);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);


    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'submit':
            if(message.text === 0) {
              this.showError('请输入大于 0 的有效数字');
              return;
            }
            // 关闭当前 panel
            this.dispose();
            // 重新启动一个定时器任务
            new Timer({ time: message.text }).start(extensionUri);
            break;
        }
      },
      null,
      this._disposables
    );
  }

  private _createPanel(webview: vscode.Webview) {
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    const livePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'live.jpg');


    const livePngSrc = webview.asWebviewUri(livePathOnDisk);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <!--
              Use a content security policy to only allow loading images from https or from our extension directory,
              and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
    
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

        <title>healthy warning</title>

        <style>
            body {
                margin: 0 auto;
                text-align: center;
            }
            h4 {
                font-size: 1.5em;
                color: #666;
                margin-top: 5em;
                margin-bottom: 3em;
            }
        </style>
    </head>
    <body>
        <h4>休息一下吧，起来喝杯水，身体是革命的本钱 </h4>
        <img src="${livePngSrc}" width="550" />
        <div>
          <label for="time">自定义时间（单位分钟）:</label>
          <input type="number" value="30" min="0" id="time" name="time" required placeholder='请输入自定义时间，单位是分钟'/>
        </div>
        <div>
          <input type="button" id='submit' value="开始" />
        </div>
        
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  public dispose() {
    HealthyPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
  };
}
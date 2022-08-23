// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();
    const submit = document.getElementById('submit');
    submit.addEventListener('click', function () {
        const value = document.getElementById('time').value;
        vscode.postMessage({
            command: 'submit',
            text: Number(value)
        });
    });
}());

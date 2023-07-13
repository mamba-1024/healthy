// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();
    const submit = document.getElementById('submit');
    const preview = document.getElementById('preview');
    submit.addEventListener('click', function () {
        const value = document.getElementById('time').value;
        const imgUrl = document.getElementById('imgUrl').value;
        // document.getElementById('img').src = imgUrl;
        vscode.postMessage({
            command: 'submit',
            text: Number(value),
            imgUrl: imgUrl,
        });
    });
    preview.addEventListener('click', function () {
        const imgUrl = document.getElementById('imgUrl').value;
        if(imgUrl) {
            document.getElementById('img').src = imgUrl;
            return;
        }
        vscode.postMessage({
            command: 'view',
        });
    });
}());

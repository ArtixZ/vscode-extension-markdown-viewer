import * as vscode from "vscode";
import { marked } from "marked";

export class MarkdownPreviewProvider
    implements vscode.CustomTextEditorProvider
{
    constructor(private readonly extensionUri: vscode.Uri) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(
            webviewPanel.webview,
            document
        );

        let isEditMode = false;

        // Configure marked for better code block handling
        marked.setOptions({
            gfm: true,
            breaks: false,
            pedantic: false,
        });

        const updateWebview = () => {
            const renderer = new marked.Renderer();

            // Custom code block renderer with HTML escaping
            renderer.code = (code: string, language?: string) => {
                const validLanguage =
                    language && language.length > 0 ? language : "text";
                // Escape HTML entities to prevent rendering
                const escapedCode = code
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
                return `<pre data-lang="${validLanguage}"><code class="language-${validLanguage}">${escapedCode}</code></pre>`;
            };

            // Custom table renderer for better styling
            renderer.table = (header: string, body: string) => {
                return `<table>\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table>\n`;
            };

            const html = marked(document.getText(), { renderer });

            webviewPanel.webview.postMessage({
                type: "update",
                html: html,
                text: document.getText(),
                isEditMode: isEditMode,
            });
        };

        // Hook up event handlers so that we can synchronize the webview with the text document
        const changeDocumentSubscription =
            vscode.workspace.onDidChangeTextDocument((e) => {
                if (e.document.uri.toString() === document.uri.toString()) {
                    updateWebview();
                }
            });

        // Make sure we get rid of the listener when our editor is closed
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // Receive message from the webview
        webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case "toggleMode":
                    isEditMode = !isEditMode;
                    updateWebview();
                    return;
                case "edit":
                    this.updateTextDocument(document, e.text);
                    return;
            }
        });

        updateWebview();
    }

    private getHtmlForWebview(
        webview: vscode.Webview,
        document: vscode.TextDocument
    ): string {
        // Get URIs for highlight.js files from dist/media folder
        const highlightJsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "dist",
                "media",
                "highlight",
                "highlight.min.js"
            )
        );
        const highlightCssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "dist",
                "media",
                "highlight",
                "vs2015.min.css"
            )
        );

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Markdown Preview</title>
            <link rel="stylesheet" href="${highlightCssUri}">
            <script src="${highlightJsUri}"></script>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                
                .toolbar {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    z-index: 1000;
                }
                
                .toggle-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .toggle-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                
                .container {
                    max-width: none;
                    margin: 0;
                    padding-top: 40px;
                    height: calc(100vh - 40px);
                    display: flex;
                    flex-direction: column;
                }
                
                .preview-content {
                    display: block;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 0 20px;
                    overflow-y: auto;
                    height: 100%;
                }
                
                .edit-content {
                    display: none;
                    height: 100%;
                    flex: 1;
                }
                
                .editor {
                    width: 100%;
                    height: 100%;
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    padding: 15px;
                    font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    resize: none;
                    box-sizing: border-box;
                    outline: none;
                    tab-size: 4;
                }
                
                .editor:focus {
                    border-color: var(--vscode-focusBorder);
                    box-shadow: 0 0 0 1px var(--vscode-focusBorder);
                }
                
                .split-view {
                    display: none;
                    height: 100%;
                    grid-template-columns: 1fr 4px 1fr;
                    gap: 0;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                    overflow: hidden;
                    width: 100%;
                }
                
                .edit-panel {
                    background: var(--vscode-editor-background);
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    min-width: 0;
                    overflow: hidden;
                }
                
                .divider {
                    background: var(--vscode-panel-border);
                    cursor: col-resize;
                    position: relative;
                    z-index: 10;
                    user-select: none;
                }
                
                .divider:hover {
                    background: var(--vscode-focusBorder);
                }
                
                .divider::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -2px;
                    right: -2px;
                    height: 100%;
                    cursor: col-resize;
                }
                
                .preview-panel {
                    background: var(--vscode-sideBar-background);
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    min-width: 0;
                    overflow: hidden;
                }
                
                .edit-panel h3, .preview-panel h3 {
                    margin: 0;
                    padding: 10px 15px;
                    background: var(--vscode-titleBar-inactiveBackground);
                    color: var(--vscode-titleBar-inactiveForeground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    flex-shrink: 0;
                }
                
                .preview-panel h3 {
                    background: var(--vscode-titleBar-activeBackground);
                    color: var(--vscode-titleBar-activeForeground);
                }
                
                .panel-content {
                    flex: 1;
                    overflow-y: auto;
                    min-height: 0;
                }
                
                .edit-panel .panel-content {
                    padding: 0;
                }
                
                .preview-panel .panel-content {
                    padding: 20px;
                }
                
                .split-view .editor {
                    border: none;
                    border-radius: 0;
                    height: 100%;
                    width: 100%;
                    background: transparent;
                    min-width: 0;
                    flex: 1;
                }
                
                /* Remove the old resizer styles */
                
                /* Markdown styling */
                h1, h2, h3, h4, h5, h6 {
                    margin-top: 24px;
                    margin-bottom: 16px;
                    font-weight: 600;
                    line-height: 1.25;
                }
                
                h1 {
                    font-size: 2em;
                    border-bottom: 1px solid var(--vscode-textSeparator-foreground);
                    padding-bottom: 0.3em;
                }
                
                h2 {
                    font-size: 1.5em;
                    border-bottom: 1px solid var(--vscode-textSeparator-foreground);
                    padding-bottom: 0.3em;
                }
                
                h3 {
                    font-size: 1.25em;
                }
                
                code {
                    background: var(--vscode-textCodeBlock-background, rgba(110, 118, 129, 0.2));
                    color: var(--vscode-textPreformat-foreground, #e06c75);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
                    font-size: 0.85em;
                    border: 1px solid var(--vscode-textCodeBlock-background, rgba(110, 118, 129, 0.4));
                }
                
                pre {
                    background: var(--vscode-textCodeBlock-background, #2d3748);
                    color: var(--vscode-editor-foreground, #e2e8f0);
                    padding: 20px;
                    border-radius: 8px;
                    overflow-x: auto;
                    border: 1px solid var(--vscode-panel-border, #4a5568);
                    margin: 16px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                pre code {
                    background: none;
                    padding: 0;
                    border: none;
                    font-size: 0.9em;
                    color: inherit;
                    white-space: pre;
                    word-wrap: normal;
                }
                
                blockquote {
                    border-left: 4px solid var(--vscode-textQuote-border);
                    padding-left: 16px;
                    margin-left: 0;
                    font-style: italic;
                    color: var(--vscode-textQuote-foreground);
                }
                
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 16px 0;
                    border: 2px solid var(--vscode-panel-border, #4a5568);
                    border-radius: 6px;
                    overflow: hidden;
                    background: var(--vscode-editor-background, transparent);
                }
                
                th, td {
                    border: 1px solid var(--vscode-panel-border, #4a5568);
                    padding: 12px 16px;
                    text-align: left;
                    vertical-align: top;
                }
                
                th {
                    background: var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.1));
                    font-weight: 600;
                    color: var(--vscode-list-activeSelectionForeground, inherit);
                    border-bottom: 2px solid var(--vscode-panel-border, #4a5568);
                }
                
                tr:nth-child(even) td {
                    background: var(--vscode-list-inactiveSelectionBackground, rgba(255, 255, 255, 0.05));
                }
                
                tr:hover td {
                    background: var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.1));
                }
                
                ul, ol {
                    padding-left: 20px;
                }
                
                li {
                    margin-bottom: 4px;
                }
                
                a {
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                }
                
                a:hover {
                    text-decoration: underline;
                }
                
                strong {
                    font-weight: 600;
                }
                
                em {
                    font-style: italic;
                }
                
                /* Override highlight.js theme to match VSCode dark theme */
                .hljs {
                    background: var(--vscode-textCodeBlock-background, #2d3748) !important;
                    color: var(--vscode-editor-foreground, #e2e8f0) !important;
                }
                
                /* Improve code block appearance */
                pre {
                    position: relative;
                }
                
                pre::before {
                    content: attr(data-lang);
                    position: absolute;
                    top: 8px;
                    right: 12px;
                    font-size: 0.7em;
                    color: var(--vscode-descriptionForeground, #8b949e);
                    text-transform: uppercase;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }
                
                /* Better list styling */
                ul li::marker {
                    color: var(--vscode-list-highlightForeground, #58a6ff);
                }
                
                ol li::marker {
                    color: var(--vscode-list-highlightForeground, #58a6ff);
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="toolbar">
                <button class="toggle-btn" onclick="toggleMode()">Toggle Edit Mode</button>
            </div>
            
            <div class="container">
                <div id="preview-content" class="preview-content">
                    <div id="rendered-markdown"></div>
                </div>
                
                <div id="edit-content" class="edit-content">
                    <div id="split-view" class="split-view">
                        <div class="edit-panel">
                            <h3>Markdown Editor</h3>
                            <div class="panel-content">
                                <textarea id="editor" class="editor" placeholder="Enter your markdown here..."></textarea>
                            </div>
                        </div>
                        <div class="divider" id="divider"></div>
                        <div class="preview-panel">
                            <h3>Live Preview</h3>
                            <div class="panel-content">
                                <div id="live-preview"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let currentText = '';
                let currentHtml = '';
                let isEditMode = false;

                // Debug highlight.js loading
                window.addEventListener('load', () => {
                    console.log('Window loaded, checking hljs availability...');
                    console.log('hljs available:', !!window.hljs);
                    if (window.hljs) {
                        console.log('hljs version:', window.hljs.versionString);
                    }
                });

                function toggleMode() {
                    vscode.postMessage({
                        type: 'toggleMode'
                    });
                }

                function updateView() {
                    const previewContent = document.getElementById('preview-content');
                    const editContent = document.getElementById('edit-content');
                    const splitView = document.getElementById('split-view');
                    const editor = document.getElementById('editor');
                    const renderedMarkdown = document.getElementById('rendered-markdown');
                    const livePreview = document.getElementById('live-preview');

                    if (isEditMode) {
                        previewContent.style.display = 'none';
                        editContent.style.display = 'block';
                        splitView.style.display = 'grid';
                        editor.value = currentText;
                        livePreview.innerHTML = currentHtml;
                        
                        // Apply syntax highlighting to live preview
                        setTimeout(() => {
                            console.log('Highlighting live preview...');
                            if (window.hljs) {
                                const blocks = livePreview.querySelectorAll('pre code');
                                console.log('Live preview blocks:', blocks.length);
                                blocks.forEach((block) => {
                                    hljs.highlightElement(block);
                                });
                            }
                        }, 50);
                    } else {
                        previewContent.style.display = 'block';
                        editContent.style.display = 'none';
                        renderedMarkdown.innerHTML = currentHtml;
                        
                        // Apply syntax highlighting to main preview
                        setTimeout(() => {
                            console.log('Highlighting main preview...');
                            if (window.hljs) {
                                const blocks = renderedMarkdown.querySelectorAll('pre code');
                                console.log('Main preview blocks:', blocks.length);
                                blocks.forEach((block) => {
                                    hljs.highlightElement(block);
                                });
                            }
                        }, 50);
                    }
                }

                // Handle editor input - simple live preview for editing
                document.addEventListener('DOMContentLoaded', () => {
                    const editor = document.getElementById('editor');
                    
                    if (editor) {
                        editor.addEventListener('input', (e) => {
                            const text = e.target.value;
                            
                            // Debounce the save operation
                            clearTimeout(window.saveTimeout);
                            window.saveTimeout = setTimeout(() => {
                                vscode.postMessage({
                                    type: 'edit',
                                    text: text
                                });
                            }, 500);
                        });
                    }
                });

                // Handle messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'update':
                            currentText = message.text;
                            currentHtml = message.html;
                            isEditMode = message.isEditMode;
                            updateView();
                            // Apply syntax highlighting after content is updated
                            setTimeout(() => {
                                console.log('Attempting syntax highlighting...');
                                if (window.hljs) {
                                    console.log('hljs is available');
                                    const codeBlocks = document.querySelectorAll('pre code');
                                    console.log('Found code blocks:', codeBlocks.length);
                                    codeBlocks.forEach((block, index) => {
                                        console.log('Highlighting block', index, block);
                                        hljs.highlightElement(block);
                                    });
                                } else {
                                    console.error('hljs is not available');
                                }
                            }, 100);
                            break;
                    }
                });

                // Handle resizer dragging
                let isResizing = false;
                let splitView, editPanel, previewPanel, divider;

                document.addEventListener('DOMContentLoaded', () => {
                    splitView = document.getElementById('split-view');
                    editPanel = document.querySelector('.edit-panel');
                    previewPanel = document.querySelector('.preview-panel');
                    divider = document.getElementById('divider');

                    if (divider) {
                        divider.addEventListener('mousedown', startResize);
                    }
                });

                function startResize(e) {
                    isResizing = true;
                    document.addEventListener('mousemove', handleResize);
                    document.addEventListener('mouseup', stopResize);
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                    e.preventDefault();
                }

                function handleResize(e) {
                    if (!isResizing || !splitView) return;

                    const rect = splitView.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const totalWidth = rect.width;
                    const dividerWidth = 4; // 4px divider
                    
                    // Calculate percentage, ensuring minimum widths
                    let leftPercent = (offsetX / totalWidth) * 100;
                    leftPercent = Math.max(20, Math.min(80, leftPercent)); // Limit between 20% and 80%
                    
                    const rightPercent = 100 - leftPercent - (dividerWidth / totalWidth * 100);
                    
                    // Update grid template columns
                    splitView.style.gridTemplateColumns = leftPercent + '% ' + dividerWidth + 'px ' + rightPercent + '%';
                }

                function stopResize() {
                    isResizing = false;
                    document.removeEventListener('mousemove', handleResize);
                    document.removeEventListener('mouseup', stopResize);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                }
            </script>
        </body>
        </html>`;
    }

    private updateTextDocument(document: vscode.TextDocument, text: string) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            text
        );
        return vscode.workspace.applyEdit(edit);
    }
}

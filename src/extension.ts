import * as vscode from "vscode";
import { MarkdownPreviewProvider } from "./markdownPreviewProvider";

export function activate(context: vscode.ExtensionContext) {
    console.log("Markdown Viewer Extension is activating...");
    try {
        const provider = new MarkdownPreviewProvider(context.extensionUri);

        // Register the custom editor provider
        context.subscriptions.push(
            vscode.window.registerCustomEditorProvider(
                "markdownViewer.preview",
                provider,
                {
                    webviewOptions: {
                        retainContextWhenHidden: true,
                    },
                    supportsMultipleEditorsPerDocument: false,
                }
            )
        );

        // Register commands
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "markdownViewer.openPreview",
                () => {
                    const activeEditor = vscode.window.activeTextEditor;
                    if (
                        activeEditor &&
                        activeEditor.document.fileName.endsWith(".md")
                    ) {
                        vscode.commands.executeCommand(
                            "vscode.openWith",
                            activeEditor.document.uri,
                            "markdownViewer.preview"
                        );
                    }
                }
            )
        );

        context.subscriptions.push(
            vscode.commands.registerCommand("markdownViewer.toggleMode", () => {
                const activeEditor = vscode.window.activeTextEditor;
                if (
                    activeEditor &&
                    activeEditor.document.fileName.endsWith(".md")
                ) {
                    // If current editor is the preview, open in text editor
                    if (activeEditor.viewColumn) {
                        vscode.commands.executeCommand(
                            "vscode.openWith",
                            activeEditor.document.uri,
                            "default"
                        );
                    } else {
                        // If current editor is text editor, open preview
                        vscode.commands.executeCommand(
                            "vscode.openWith",
                            activeEditor.document.uri,
                            "markdownViewer.preview"
                        );
                    }
                }
            })
        );

        // Register context menu for markdown files
        context.subscriptions.push(
            vscode.commands.registerCommand(
                "markdownViewer.openPreviewFromExplorer",
                (uri: vscode.Uri) => {
                    vscode.commands.executeCommand(
                        "vscode.openWith",
                        uri,
                        "markdownViewer.preview"
                    );
                }
            )
        );

        console.log("Markdown Viewer Extension activated successfully!");
    } catch (error) {
        console.error("Failed to activate Markdown Viewer Extension:", error);
        vscode.window.showErrorMessage(
            `Markdown Viewer Extension failed to activate: ${error}`
        );
    }
}

export function deactivate() {}

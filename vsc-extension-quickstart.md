# Welcome to your VS Code Extension

## What's in the folder

-   This folder contains all of the files necessary for your extension.
-   `package.json` - this is the manifest file in which you declare your extension and command.
-   `src/extension.ts` - this is the main file where you will provide the implementation of your extension.
-   `src/markdownPreviewProvider.ts` - this contains the custom editor provider for markdown files.

## Get up and running straight away

-   Press `F5` to open a new window with your extension loaded.
-   Open any `.md` file to see your extension in action.
-   The extension will automatically open markdown files in preview mode.
-   Use the toolbar buttons to toggle between preview and edit modes.

## Make changes

-   You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts` or `src/markdownPreviewProvider.ts`.
-   You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Explore the API

-   You can open the full set of our API when you open the file `node_modules/@types/vscode/index.d.ts`.

## Run tests

-   Open the debug viewlet (`Ctrl+Shift+D` or `Cmd+Shift+D` on Mac) and from the launch configuration dropdown pick `Extension Tests`.
-   Press `F5` to run the tests in a new window with your extension loaded.
-   See the output of the test result in the debug console.
-   Make changes to `src/test/suite/extension.test.ts` or create new test files inside the `src/test/suite` folder.
    -   The provided test runner will only consider files matching the pattern `**/*.test.ts`.
    -   You can create folders inside the `test` folder and it will find all files.

## Go further

-   Reduce the extension size and improve the startup time by [bundling your extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension).
-   [Publish your extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) on the VSCode marketplace.
-   Automate builds by setting up [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration).

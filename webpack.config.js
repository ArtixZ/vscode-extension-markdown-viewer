const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

/**@type {import('webpack').Configuration}*/
const config = {
    target: "node", // VSCode extensions run in a Node.js-context
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, "dist"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
    },
    externals: {
        vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    },
    devtool: "nosources-source-map",
    infrastructureLogging: {
        level: "log", // enables logging required for problem matchers
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "node_modules/@highlightjs/cdn-assets/highlight.min.js",
                    to: "media/highlight/highlight.min.js",
                },
                {
                    from: "node_modules/@highlightjs/cdn-assets/styles/vs2015.min.css",
                    to: "media/highlight/vs2015.min.css",
                },
            ],
        }),
    ],
};
module.exports = config;

import * as vscode from "vscode";
import * as path from "path";

interface CustomDocument extends vscode.CustomDocument {
    readonly uri: vscode.Uri;
}

interface LoadModelMessage {
    readonly type: "ready";
}

interface ScreenshotMessage {
    readonly type: "save-screenshot";
    readonly data: string;
}

type WebviewMessage =
    | LoadModelMessage
    | ScreenshotMessage;

export function activate(
    context: vscode.ExtensionContext
): void {

    const provider =
        new ModelViewerProvider(context);

    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            "3d-studio.viewer",
            provider,
            {
                supportsMultipleEditorsPerDocument: false,

                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "3d-studio.open",
            async () => {

                const result =
                    await vscode.window.showOpenDialog({
                        canSelectMany: false,

                        openLabel:
                            "Open 3D Model",

                        filters: {
                            "3D Models": [
                                "glb",
                                "gltf",
                                "obj",
                                "stl"
                            ]
                        }
                    });

                if (
                    !result ||
                    result.length === 0
                ) {
                    return;
                }

                await vscode.commands.executeCommand(
                    "vscode.openWith",
                    result[0],
                    "3d-studio.viewer"
                );
            }
        )
    );
}

class ModelViewerProvider
    implements vscode.CustomEditorProvider<CustomDocument> {

    private readonly context:
        vscode.ExtensionContext;

    private readonly documentChangeEmitter =
        new vscode.EventEmitter<
            vscode.CustomDocumentEditEvent<CustomDocument>
        >();

    readonly onDidChangeCustomDocument =
        this.documentChangeEmitter.event;

    constructor(
        context: vscode.ExtensionContext
    ) {

        this.context = context;
    }

    openCustomDocument(
        uri: vscode.Uri
    ): CustomDocument {

        return {
            uri,

            dispose(): void {
                // Read-only document.
            }
        };
    }

    saveCustomDocument(
        _document: CustomDocument,
        _cancellation: vscode.CancellationToken
    ): Thenable<void> {

        return Promise.resolve();
    }

    saveCustomDocumentAs(
        _document: CustomDocument,
        _destination: vscode.Uri,
        _cancellation: vscode.CancellationToken
    ): Thenable<void> {

        return Promise.resolve();
    }

    revertCustomDocument(
        _document: CustomDocument,
        _cancellation: vscode.CancellationToken
    ): Thenable<void> {

        return Promise.resolve();
    }

    backupCustomDocument(
        _document: CustomDocument,
        backupContext: vscode.CustomDocumentBackupContext,
        _cancellation: vscode.CancellationToken
    ): Thenable<vscode.CustomDocumentBackup> {

        return Promise.resolve({
            id: backupContext.destination.toString(),

            delete(): void {
                // Read-only viewer.
            }
        });
    }

    async resolveCustomEditor(
        document: CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {

        webviewPanel.webview.options = {
            enableScripts: true,

            localResourceRoots: [
                vscode.Uri.joinPath(
                    this.context.extensionUri,
                    "dist"
                ),

                vscode.Uri.joinPath(
                    this.context.extensionUri,
                    "media"
                )
            ]
        };

        const scriptUri =
            webviewPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(
                    this.context.extensionUri,
                    "dist",
                    "viewer.js"
                )
            );

        const styleUri =
            webviewPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(
                    this.context.extensionUri,
                    "media",
                    "ui",
                    "styles.css"
                )
            );

        const logoUri =
            webviewPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(
                    this.context.extensionUri,
                    "media",
                    "3D_Logo.png"
                )
            );

        const nonce =
            getNonce();

        webviewPanel.webview.html =
            this.getHtml(
                webviewPanel.webview,
                scriptUri,
                styleUri,
                logoUri,
                nonce
            );

        webviewPanel.webview.onDidReceiveMessage(
            async (
                message: WebviewMessage
            ) => {

                if (
                    message.type === "ready"
                ) {

                    await this.sendModel(
                        document,
                        webviewPanel
                    );
                }

                if (
                    message.type === "save-screenshot"
                ) {

                    await this.saveScreenshot(
                        message.data
                    );
                }
            },

            undefined,

            this.context.subscriptions
        );
    }

    private async sendModel(
        document: CustomDocument,
        panel: vscode.WebviewPanel
    ): Promise<void> {

        try {

            const bytes =
                await vscode.workspace.fs.readFile(
                    document.uri
                );

            const fileName =
                path.basename(
                    document.uri.fsPath
                );

            const extension =
                path.extname(fileName)
                    .toLowerCase()
                    .replace(".", "");

            panel.webview.postMessage({
                type: "load-model",
                fileName,
                extension,
                data: Array.from(bytes)
            });

        } catch (error) {

            panel.webview.postMessage({
                type: "load-error",
                message: String(error)
            });
        }
    }

    private async saveScreenshot(
        dataUrl: string
    ): Promise<void> {

        try {

            const uri =
                await vscode.window.showSaveDialog({
                    title:
                        "Save 3D Studio Screenshot",

                    saveLabel:
                        "Save Screenshot",

                    filters: {
                        "PNG Image": [
                            "png"
                        ]
                    },

                    defaultUri:
                        vscode.Uri.file(
                            "3d-studio-screenshot.png"
                        )
                });

            if (!uri) {
                return;
            }

            const parts =
                dataUrl.split(",");

            const base64 =
                parts[1];

            if (!base64) {
                throw new Error(
                    "Invalid screenshot data."
                );
            }

            const buffer =
                Buffer.from(
                    base64,
                    "base64"
                );

            await vscode.workspace.fs.writeFile(
                uri,
                buffer
            );

            vscode.window.showInformationMessage(
                "3D Studio screenshot saved successfully."
            );

        } catch (error) {

            vscode.window.showErrorMessage(
                `Failed to save screenshot: ${String(error)}`
            );
        }
    }

    private getHtml(
        webview: vscode.Webview,
        scriptUri: vscode.Uri,
        styleUri: vscode.Uri,
        logoUri: vscode.Uri,
        nonce: string
    ): string {

        const csp = [
            "default-src 'none'",
            `style-src ${webview.cspSource}`,
            `script-src 'nonce-${nonce}'`,
            "img-src data: blob: https:"
        ].join("; ");

        return `<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        http-equiv="Content-Security-Policy"
        content="${csp}"
    >

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <link
        rel="stylesheet"
        href="${styleUri}"
    >

    <title>3D Studio</title>

</head>

<body>

<div id="app">

    <!-- =====================================================
         HEADER
         ===================================================== -->

    <header class="topbar">

        <div class="brand">

            <img
                class="brand-logo"
                src="${logoUri}"
                alt="3D Studio"
            >

            <div class="brand-info">

                <div class="brand-title">
                    3D Studio
                </div>

                <div
                    id="model-name"
                    class="model-name"
                >
                    No model loaded
                </div>

            </div>

        </div>

        <div class="toolbar">

            <button
                id="reset-btn"
                class="tool-button"
                title="Reset camera (R)"
            >
                ↻
                <span>Reset</span>
            </button>

            <button
                id="fit-btn"
                class="tool-button"
                title="Fit model (F)"
            >
                ⛶
                <span>Fit</span>
            </button>

            <button
                id="grid-btn"
                class="tool-button active"
                title="Toggle grid (G)"
            >
                #
                <span>Grid</span>
            </button>

            <button
                id="axes-btn"
                class="tool-button"
                title="Toggle axes"
            >
                𝒙𝐲𝔃
                <span>Axes</span>
            </button>

            <button
                id="box-btn"
                class="tool-button"
                title="Toggle bounding box"
            >
                □
                <span>Box</span>
            </button>

            <button
                id="wireframe-btn"
                class="tool-button"
                title="Toggle wireframe (W)"
            >
                ◇
                <span>Wire</span>
            </button>


            <!-- =================================================
                 VIEW MODE DROPDOWN
                 ================================================= -->

            <div
                id="view-mode-container"
                class="view-mode-container"
            >


                <select
                    id="view-mode-select"
                    class="view-mode-select"
                    title="Select View Mode"
                    aria-label="Select View Mode"
                >

                    <option
                        value="solid"
                    >
                       ⬤ Solid
                    </option>

                    <option
                        value="wireframe"
                    >
                       ⧉ Wireframe
                    </option>

                    <option
                        value="xray"
                    >
                       ☐ X-Ray
                    </option>

                </select>

            </div>


            <button
                id="rotate-btn"
                class="tool-button"
                title="Auto rotate (A)"
            >
                ⟳
                <span>Rotate</span>
            </button>

            <button
                id="screenshot-btn"
                class="tool-button"
                title="Save screenshot"
            >
                ▣
                <span>PNG</span>
            </button>

        </div>

    </header>


    <!-- =====================================================
         VIEWER
         ===================================================== -->

    <main id="viewer-container">

        <div
            id="loading"
            class="loading"
        >

            <div class="loader"></div>

            <div>
                Loading 3D model...
            </div>

        </div>


        <div
            id="empty-state"
            class="empty-state"
        >

            <div class="empty-icon">
                ◈
            </div>

            <h2>
                3D Studio
            </h2>

            <p>
                Open a GLB, GLTF, OBJ or STL file
                to view it here.
            </p>

        </div>


        <!-- =================================================
             CONTROLS PANEL
             ================================================= -->

        <div
            id="controls-panel"
            class="floating-panel controls-panel"
        >

            <button
                id="controls-header"
                class="panel-header"
                type="button"
            >

                <span class="panel-title">

                    <span class="panel-icon">
                        🌣
                    </span>

                    Controls

                </span>

                <span
                    id="controls-arrow"
                    class="panel-arrow"
                >
                    ⮞
                </span>

            </button>

            <div
                id="controls-content"
                class="panel-content"
            >

                <div class="control-row">
                    <span>Left drag</span>
                    <span>Rotate</span>
                </div>

                <div class="control-row">
                    <span>Right drag</span>
                    <span>Pan</span>
                </div>

                <div class="control-row">
                    <span>Scroll</span>
                    <span>Zoom</span>
                </div>

                <div class="control-row">
                    <span>R</span>
                    <span>Reset</span>
                </div>

                <div class="control-row">
                    <span>F</span>
                    <span>Fit</span>
                </div>

                <div class="control-row">
                    <span>G</span>
                    <span>Grid</span>
                </div>

                <div class="control-row">
                    <span>W</span>
                    <span>Wireframe</span>
                </div>

                <div class="control-row">
                    <span>A</span>
                    <span>Auto Rotate</span>
                </div>

            </div>

        </div>


        <!-- =================================================
             MODEL INFO PANEL
             ================================================= -->

        <div
            id="stats-panel"
            class="floating-panel stats-panel"
        >

            <button
                id="stats-header"
                class="panel-header"
                type="button"
            >

                <span class="panel-title">

                    <span class="panel-icon">
                        🛈
                    </span>

                    Model Info

                </span>

                <span
                    id="stats-arrow"
                    class="panel-arrow"
                >
                    ⮞
                </span>

            </button>

            <div
                id="stats-content"
                class="panel-content"
            >
            </div>

        </div>


        <!-- =================================================
             STATUS
             ================================================= -->

        <div
            id="status-bar"
            class="status-bar"
        >
            Ready
        </div>

    </main>

</div>

<script
    nonce="${nonce}"
    src="${scriptUri}"
></script>

</body>

</html>`;
    }
}

function getNonce(): string {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (
        let i = 0;
        i < 32;
        i++
    ) {

        result +=
            characters.charAt(
                Math.floor(
                    Math.random() *
                    characters.length
                )
            );
    }

    return result;
}

export function deactivate(): void {
    // Nothing to clean up.
}
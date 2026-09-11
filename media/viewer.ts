/// <reference lib="dom" />

import * as THREE from "three";

import {
    createScene
} from "./core/scene.js";

import {
    createCamera
} from "./core/camera.js";

import {
    createRenderer
} from "./core/renderer.js";

import {
    createLighting
} from "./core/lighting.js";

import {
    loadModel
} from "./loaders/model-loader.js";

import {
    GridFeature
} from "./features/grid.js";

import {
    AxesFeature
} from "./features/axes.js";

import {
    WireframeFeature
} from "./features/wireframe.js";

import {
    AutoRotateFeature
} from "./features/auto-rotate.js";

import {
    BoundingBoxFeature
} from "./features/bounding-box.js";

import {
    ScreenshotFeature
} from "./features/screenshot.js";

import {
    ViewModeFeature,
    ViewMode
} from "./features/view-mode.js";

import {
    calculateModelStats
} from "./utils/model-stats.js";

import {
    calculateModelBounds,
    prepareModel
} from "./utils/model-utils.js";

import {
    setupKeyboardShortcuts
} from "./utils/keyboard.js";

import {
    Toolbar
} from "./ui/toolbar.js";

import {
    StatsPanel
} from "./ui/stats-panel.js";

import {
    StatusBar
} from "./ui/status-bar.js";

import {
    CollapsiblePanels
} from "./ui/collapsible-panels.js";


/* =========================================================
   VSCODE API
   ========================================================= */

interface VsCodeApi {

    postMessage(
        message: unknown
    ): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

const vscode =
    acquireVsCodeApi();


/* =========================================================
   WEBVIEW MESSAGES
   ========================================================= */

interface LoadModelMessage {

    type: "load-model";

    fileName: string;

    extension: string;

    data: number[];
}

interface LoadErrorMessage {

    type: "load-error";

    message: string;
}

type WebviewMessage =
    | LoadModelMessage
    | LoadErrorMessage;


/* =========================================================
   CONTAINER
   ========================================================= */

const container =
    document.getElementById(
        "viewer-container"
    ) as HTMLElement;

if (!container) {

    throw new Error(
        "Viewer container not found."
    );
}


/* =========================================================
   THREE.JS CORE
   ========================================================= */

const scene =
    createScene();

const {
    camera,
    controls
} = createCamera(
    container
);

const renderer =
    createRenderer(
        container
    );

createLighting(
    scene
);


/* =========================================================
   FEATURES
   ========================================================= */

const grid =
    new GridFeature(
        scene
    );

const axes =
    new AxesFeature(
        scene
    );

const wireframe =
    new WireframeFeature();

const autoRotate =
    new AutoRotateFeature();

const boundingBox =
    new BoundingBoxFeature(
        scene
    );

const viewMode =
    new ViewModeFeature();


/* =========================================================
   UI
   ========================================================= */

const statusBar =
    new StatusBar();

const statsPanel =
    new StatsPanel();

new CollapsiblePanels([
    {
        panelId:
            "controls-panel",

        headerId:
            "controls-header"
    },

    {
        panelId:
            "stats-panel",

        headerId:
            "stats-header"
    }
]);


/* =========================================================
   MODEL STATE
   ========================================================= */

let model:
    THREE.Object3D | null = null;

let mixer:
    THREE.AnimationMixer | null = null;

const clock =
    new THREE.Clock();


/* =========================================================
   TOOLBAR
   ========================================================= */

const toolbar =
    new Toolbar({

        reset: () => {

            resetCamera();
        },

        fit: () => {

            fitModel();
        },

        grid: () => {

            grid.toggle();

            toolbar.setActive(
                "grid-btn",
                grid.isVisible()
            );
        },

        axes: () => {

            axes.toggle();

            toolbar.setActive(
                "axes-btn",
                axes.isVisible()
            );
        },

        box: () => {

            boundingBox.toggle();

            toolbar.setActive(
                "box-btn",
                boundingBox.isVisible()
            );
        },

        wireframe: () => {

            if (!model) {
                return;
            }

            const enabled =
                wireframe.toggle(
                    model
                );

            toolbar.setActive(
                "wireframe-btn",
                enabled
            );
        },

        /* =====================================================
           VIEW MODE DROPDOWN
           ===================================================== */

        viewMode: (
            mode: ViewMode
        ) => {

            if (!model) {

                toolbar.setViewMode(
                    "solid"
                );

                return;
            }

            viewMode.setMode(
                model,
                mode
            );

            statusBar.set(
                `View mode: ${getViewModeName(mode)}`
            );
        },

        rotate: () => {

            const enabled =
                autoRotate.toggle();

            toolbar.setActive(
                "rotate-btn",
                enabled
            );
        },

        screenshot: () => {

            screenshot.capture();
        }
    });


/* =========================================================
   SCREENSHOT
   ========================================================= */

const screenshot =
    new ScreenshotFeature(
        renderer,

        (
            dataUrl: string
        ) => {

            vscode.postMessage({
                type:
                    "save-screenshot",

                data:
                    dataUrl
            });
        }
    );


/* =========================================================
   CLEAR MODEL
   ========================================================= */

function clearCurrentModel(): void {

    if (!model) {
        return;
    }

    scene.remove(
        model
    );

    model.traverse(
        (
            object
        ) => {

            if (
                object instanceof THREE.Mesh
            ) {

                object.geometry.dispose();

                const materials =
                    Array.isArray(
                        object.material
                    )
                        ? object.material
                        : [object.material];

                for (
                    const material
                    of materials
                ) {

                    material.dispose();
                }
            }
        }
    );

    model = null;

    mixer = null;

    statsPanel.clear();
}


/* =========================================================
   LOAD MODEL
   ========================================================= */

async function handleLoadModel(
    message: LoadModelMessage
): Promise<void> {

    try {

        statusBar.set(
            `Loading ${message.fileName}...`
        );

        const loading =
            document.getElementById(
                "loading"
            );

        const empty =
            document.getElementById(
                "empty-state"
            );

        if (loading) {

            loading.style.display =
                "flex";
        }

        if (empty) {

            empty.style.display =
                "none";
        }

        clearCurrentModel();

        const data =
            new Uint8Array(
                message.data
            );

        const result =
            await loadModel(
                message.extension,
                data
            );

        model =
            result.object;

        prepareModel(
            model
        );

        scene.add(
            model
        );


        /* =================================================
           ANIMATIONS
           ================================================= */

        if (
            result.animations.length > 0
        ) {

            mixer =
                new THREE.AnimationMixer(
                    model
                );

            for (
                const clip
                of result.animations
            ) {

                const action =
                    mixer.clipAction(
                        clip
                    );

                action.play();
            }
        }


        /* =================================================
           MODEL INFORMATION
           ================================================= */

        const bounds =
            calculateModelBounds(
                model
            );

        const stats =
            calculateModelStats(
                model
            );


        /* =================================================
           FEATURES
           ================================================= */

        boundingBox.update(
            model
        );

        statsPanel.update(
            stats,
            bounds
        );


        /* =================================================
           DEFAULT VIEW MODE
           ================================================= */

        viewMode.setMode(
            model,
            "solid"
        );

        toolbar.setViewMode(
            "solid"
        );

        toolbar.setActive(
            "wireframe-btn",
            false
        );


        /* =================================================
           FIT CAMERA
           ================================================= */

        fitModel();


        /* =================================================
           MODEL NAME
           ================================================= */

        const modelName =
            document.getElementById(
                "model-name"
            );

        if (modelName) {

            modelName.textContent =
                message.fileName;
        }


        /* =================================================
           FINISH
           ================================================= */

        if (loading) {

            loading.style.display =
                "none";
        }

        statusBar.set(
            `${message.fileName} • ${message.extension.toUpperCase()} • ${stats.meshes} mesh${stats.meshes === 1 ? "" : "es"}`
        );

    } catch (error) {

        console.error(
            "Model loading failed:",
            error
        );

        statusBar.set(
            `Error loading model: ${String(error)}`
        );

        const loading =
            document.getElementById(
                "loading"
            );

        if (loading) {

            loading.style.display =
                "none";
        }
    }
}


/* =========================================================
   RESET CAMERA
   ========================================================= */

function resetCamera(): void {

    camera.position.set(
        3,
        2,
        5
    );

    controls.target.set(
        0,
        0,
        0
    );

    controls.update();

    statusBar.set(
        "Camera reset"
    );
}


/* =========================================================
   FIT MODEL
   ========================================================= */

function fitModel(): void {

    if (!model) {
        return;
    }

    const bounds =
        calculateModelBounds(
            model
        );

    const center =
        bounds.center;

    const radius =
        Math.max(
            bounds.radius,
            0.01
        );

    const fov =
        THREE.MathUtils.degToRad(
            camera.fov
        );

    const distance =
        radius /
        Math.sin(
            fov / 2
        );

    const direction =
        new THREE.Vector3(
            1,
            0.7,
            1
        ).normalize();

    camera.position.copy(
        center.clone().add(
            direction.multiplyScalar(
                distance * 1.15
            )
        )
    );

    camera.near =
        Math.max(
            radius / 1000,
            0.001
        );

    camera.far =
        Math.max(
            radius * 100,
            100
        );

    camera.updateProjectionMatrix();

    controls.target.copy(
        center
    );

    controls.update();

    statusBar.set(
        "Model fitted to view"
    );
}


/* =========================================================
   VIEW MODE NAME
   ========================================================= */

function getViewModeName(
    mode: ViewMode
): string {

    switch (mode) {

        case "wireframe":
            return "Wireframe";

        case "xray":
            return "X-Ray";

        case "solid":
        default:
            return "Solid";
    }
}


/* =========================================================
   RESIZE
   ========================================================= */

function handleResize(): void {

    const width =
        container.clientWidth || 1;

    const height =
        container.clientHeight || 1;

    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
        width,
        height
    );
}

window.addEventListener(
    "resize",
    handleResize
);


/* =========================================================
   WEBVIEW MESSAGE LISTENER
   ========================================================= */

window.addEventListener(
    "message",
    (
        event: MessageEvent<WebviewMessage>
    ) => {

        const message =
            event.data;

        if (
            message.type === "load-model"
        ) {

            void handleLoadModel(
                message
            );

        } else if (
            message.type === "load-error"
        ) {

            statusBar.set(
                message.message
            );
        }
    }
);


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

setupKeyboardShortcuts({

    reset: () => {

        resetCamera();
    },

    fit: () => {

        fitModel();
    },

    toggleGrid: () => {

        grid.toggle();

        toolbar.setActive(
            "grid-btn",
            grid.isVisible()
        );
    },

    toggleWireframe: () => {

        if (!model) {
            return;
        }

        const enabled =
            wireframe.toggle(
                model
            );

        toolbar.setActive(
            "wireframe-btn",
            enabled
        );

        if (enabled) {

            toolbar.setViewMode(
                "wireframe"
            );

            viewMode.setMode(
                model,
                "wireframe"
            );

        } else {

            toolbar.setViewMode(
                "solid"
            );

            viewMode.setMode(
                model,
                "solid"
            );
        }
    },

    toggleAutoRotate: () => {

        const enabled =
            autoRotate.toggle();

        toolbar.setActive(
            "rotate-btn",
            enabled
        );
    }
});


/* =========================================================
   RENDER LOOP
   ========================================================= */

function animate(): void {

    requestAnimationFrame(
        animate
    );

    const delta =
        clock.getDelta();

    if (mixer) {

        mixer.update(
            delta
        );
    }

    if (model) {

        autoRotate.update(
            model
        );
    }

    controls.update();

    renderer.render(
        scene,
        camera
    );
}

animate();


/* =========================================================
   READY
   ========================================================= */

vscode.postMessage({
    type: "ready"
});
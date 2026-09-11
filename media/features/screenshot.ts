import * as THREE from "three";

export class ScreenshotFeature {

    constructor(
        private readonly renderer: THREE.WebGLRenderer,
        private readonly onSave: (
            dataUrl: string
        ) => void
    ) {}

    capture(): void {

        const dataUrl =
            this.renderer.domElement.toDataURL(
                "image/png"
            );

        this.onSave(dataUrl);
    }
}
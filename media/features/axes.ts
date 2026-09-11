import * as THREE from "three";

export class AxesFeature {

    private axes: THREE.AxesHelper;

    constructor(scene: THREE.Scene) {

        this.axes =
            new THREE.AxesHelper(3);

        this.axes.visible = false;

        scene.add(this.axes);
    }

    toggle(): void {
        this.axes.visible =
            !this.axes.visible;
    }

    setVisible(
        visible: boolean
    ): void {

        this.axes.visible = visible;
    }

    isVisible(): boolean {
        return this.axes.visible;
    }
}
import * as THREE from "three";

export class AutoRotateFeature {

    private enabled = false;

    private speed = 0.01;

    update(
        root: THREE.Object3D
    ): void {

        if (!this.enabled) {
            return;
        }

        root.rotation.y +=
            this.speed;
    }

    setEnabled(
        enabled: boolean
    ): void {

        this.enabled = enabled;
    }

    setSpeed(
        speed: number
    ): void {

        this.speed = speed;
    }

    toggle(): boolean {

        this.enabled =
            !this.enabled;

        return this.enabled;
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
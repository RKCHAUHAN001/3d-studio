import * as THREE from "three";

export class BoundingBoxFeature {

    private readonly box: THREE.Box3Helper;

    private readonly box3 =
        new THREE.Box3();

    constructor(scene: THREE.Scene) {

        this.box =
            new THREE.Box3Helper(
                this.box3,
                0x00aaff
            );

        this.box.visible = false;

        scene.add(this.box);
    }

    update(
        object: THREE.Object3D
    ): void {

        this.box3.setFromObject(
            object
        );
    }

    toggle(): void {

        this.box.visible =
            !this.box.visible;
    }

    setVisible(
        visible: boolean
    ): void {

        this.box.visible = visible;
    }

    isVisible(): boolean {
        return this.box.visible;
    }
}
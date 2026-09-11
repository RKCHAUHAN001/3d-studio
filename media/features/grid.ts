import * as THREE from "three";

export class GridFeature {

    private readonly grid: THREE.GridHelper;

    constructor(scene: THREE.Scene) {

        this.grid =
            new THREE.GridHelper(
                20,
                20,
                0x555555,
                0x333333
            );

        this.grid.position.y = 0;

        scene.add(this.grid);
    }

    toggle(): void {
        this.grid.visible =
            !this.grid.visible;
    }

    setVisible(
        visible: boolean
    ): void {

        this.grid.visible = visible;
    }

    isVisible(): boolean {
        return this.grid.visible;
    }
}
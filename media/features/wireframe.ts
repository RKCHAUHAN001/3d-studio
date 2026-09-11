import * as THREE from "three";

type WireframeMaterial =
    THREE.Material & {
        wireframe?: boolean;
    };

export class WireframeFeature {

    private enabled = false;

    toggle(
        root: THREE.Object3D
    ): boolean {

        this.enabled =
            !this.enabled;

        this.apply(
            root,
            this.enabled
        );

        return this.enabled;
    }

    setEnabled(
        root: THREE.Object3D,
        enabled: boolean
    ): void {

        this.enabled = enabled;

        this.apply(
            root,
            enabled
        );
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    private apply(
        root: THREE.Object3D,
        enabled: boolean
    ): void {

        root.traverse(
            (object) => {

                if (
                    !(object instanceof THREE.Mesh)
                ) {
                    return;
                }

                const materials =
                    Array.isArray(object.material)
                        ? object.material
                        : [object.material];

                for (
                    const material
                    of materials
                ) {

                    const wireMaterial =
                        material as WireframeMaterial;

                    if (
                        "wireframe"
                        in wireMaterial
                    ) {

                        wireMaterial.wireframe =
                            enabled;
                    }
                }
            }
        );
    }
}
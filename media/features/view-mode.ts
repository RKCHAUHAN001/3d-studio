import * as THREE from "three";

export type ViewMode =
    | "solid"
    | "wireframe"
    | "xray";

interface MaterialState {
    material: THREE.Material;
    wireframe?: boolean;
    transparent: boolean;
    opacity: number;
    depthWrite: boolean;
}

export class ViewModeFeature {

    private mode: ViewMode = "solid";

    private readonly states =
        new Map<
            THREE.Mesh,
            MaterialState[]
        >();

    getMode(): ViewMode {
        return this.mode;
    }

    next(
        root: THREE.Object3D
    ): ViewMode {

        if (this.mode === "solid") {
            this.mode = "wireframe";
        } else if (
            this.mode === "wireframe"
        ) {
            this.mode = "xray";
        } else {
            this.mode = "solid";
        }

        this.apply(
            root,
            this.mode
        );

        return this.mode;
    }

    setMode(
        root: THREE.Object3D,
        mode: ViewMode
    ): void {

        this.mode = mode;

        this.apply(
            root,
            mode
        );
    }

    private apply(
        root: THREE.Object3D,
        mode: ViewMode
    ): void {

        root.traverse(
            (object) => {

                if (
                    !(object instanceof THREE.Mesh)
                ) {
                    return;
                }

                this.saveState(object);

                const materials =
                    Array.isArray(object.material)
                        ? object.material
                        : [object.material];

                for (
                    const material
                    of materials
                ) {

                    const m =
                        material as THREE.Material & {
                            wireframe?: boolean;
                        };

                    if (
                        mode === "solid"
                    ) {

                        if (
                            "wireframe" in m
                        ) {
                            m.wireframe = false;
                        }

                        m.transparent =
                            false;

                        m.opacity = 1;

                        m.depthWrite =
                            true;

                    } else if (
                        mode === "wireframe"
                    ) {

                        if (
                            "wireframe" in m
                        ) {
                            m.wireframe = true;
                        }

                        m.transparent =
                            false;

                        m.opacity = 1;

                        m.depthWrite =
                            true;

                    } else if (
                        mode === "xray"
                    ) {

                        if (
                            "wireframe" in m
                        ) {
                            m.wireframe = false;
                        }

                        m.transparent =
                            true;

                        m.opacity = 0.35;

                        m.depthWrite =
                            false;
                    }

                    m.needsUpdate = true;
                }
            }
        );
    }

    private saveState(
        mesh: THREE.Mesh
    ): void {

        if (this.states.has(mesh)) {
            return;
        }

        const materials =
            Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];

        const states: MaterialState[] =
            materials.map(
                (material) => {

                    const m =
                        material as THREE.Material & {
                            wireframe?: boolean;
                        };

                    return {
                        material,
                        wireframe:
                            m.wireframe,
                        transparent:
                            material.transparent,
                        opacity:
                            material.opacity,
                        depthWrite:
                            material.depthWrite
                    };
                }
            );

        this.states.set(
            mesh,
            states
        );
    }
}
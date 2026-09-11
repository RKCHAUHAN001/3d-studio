import * as THREE from "three";

export interface ModelBounds {
    box: THREE.Box3;
    center: THREE.Vector3;
    size: THREE.Vector3;
    radius: number;
}

export function calculateModelBounds(
    object: THREE.Object3D
): ModelBounds {

    const box =
        new THREE.Box3().setFromObject(
            object
        );

    const center =
        new THREE.Vector3();

    const size =
        new THREE.Vector3();

    box.getCenter(center);
    box.getSize(size);

    const radius =
        Math.max(
            size.x,
            size.y,
            size.z
        ) / 2;

    return {
        box,
        center,
        size,
        radius
    };
}

export function prepareModel(
    object: THREE.Object3D
): void {

    object.traverse(
        (child) => {

            if (
                !(child instanceof THREE.Mesh)
            ) {
                return;
            }

            child.castShadow = true;
            child.receiveShadow = true;

            if (
                child.geometry
            ) {

                child.geometry.computeBoundingBox();
                child.geometry.computeBoundingSphere();
            }
        }
    );
}
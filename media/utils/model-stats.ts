import * as THREE from "three";

export interface ModelStats {
    meshes: number;
    vertices: number;
    triangles: number;
    materials: number;
    textures: number;
}

export function calculateModelStats(
    root: THREE.Object3D
): ModelStats {

    let meshes = 0;
    let vertices = 0;
    let triangles = 0;

    const materials =
        new Set<THREE.Material>();

    const textures =
        new Set<THREE.Texture>();

    root.traverse(
        (object) => {

            if (
                !(object instanceof THREE.Mesh)
            ) {
                return;
            }

            meshes++;

            const geometry =
                object.geometry;

            const position =
                geometry.getAttribute(
                    "position"
                );

            if (position) {
                vertices +=
                    position.count;
            }

            if (geometry.index) {

                triangles +=
                    geometry.index.count / 3;

            } else if (position) {

                triangles +=
                    Math.floor(
                        position.count / 3
                    );
            }

            const materialList =
                Array.isArray(object.material)
                    ? object.material
                    : [object.material];

            for (
                const material
                of materialList
            ) {

                materials.add(material);

                const m =
                    material as THREE.Material & {
                        map?: THREE.Texture;
                        normalMap?: THREE.Texture;
                        roughnessMap?: THREE.Texture;
                        metalnessMap?: THREE.Texture;
                    };

                if (m.map) {
                    textures.add(m.map);
                }

                if (m.normalMap) {
                    textures.add(
                        m.normalMap
                    );
                }

                if (m.roughnessMap) {
                    textures.add(
                        m.roughnessMap
                    );
                }

                if (m.metalnessMap) {
                    textures.add(
                        m.metalnessMap
                    );
                }
            }
        }
    );

    return {
        meshes,
        vertices,
        triangles,
        materials: materials.size,
        textures: textures.size
    };
}
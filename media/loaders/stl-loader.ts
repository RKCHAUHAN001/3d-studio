import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const loader = new STLLoader();

export function loadSTL(
    data: Uint8Array
): THREE.Mesh {

    const arrayBuffer =
        data.buffer.slice(
            data.byteOffset,
            data.byteOffset + data.byteLength
        ) as ArrayBuffer;

    const geometry =
        loader.parse(arrayBuffer);

    geometry.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.15,
            roughness: 0.65
        });

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
}
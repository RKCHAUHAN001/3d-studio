import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface LoadedModel {
    object: THREE.Object3D;
    animations: THREE.AnimationClip[];
}

const loader = new GLTFLoader();

export function loadGLTF(
    data: Uint8Array
): Promise<LoadedModel> {

    return new Promise(
        (resolve, reject) => {

            const arrayBuffer =
                data.buffer.slice(
                    data.byteOffset,
                    data.byteOffset + data.byteLength
                ) as ArrayBuffer;

            loader.parse(
                arrayBuffer,
                "",
                (gltf) => {

                    resolve({
                        object: gltf.scene,
                        animations: gltf.animations
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        }
    );
}
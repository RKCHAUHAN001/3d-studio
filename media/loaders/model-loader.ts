import * as THREE from "three";

import {
    loadGLTF,
    LoadedModel
} from "./gltf-loader.js";

import { loadOBJ } from "./obj-loader.js";
import { loadSTL } from "./stl-loader.js";

export interface ModelLoadResult {
    object: THREE.Object3D;
    animations: THREE.AnimationClip[];
}

export async function loadModel(
    extension: string,
    data: Uint8Array
): Promise<ModelLoadResult> {

    const ext =
        extension.toLowerCase();

    if (
        ext === "glb" ||
        ext === "gltf"
    ) {

        const result: LoadedModel =
            await loadGLTF(data);

        return {
            object: result.object,
            animations: result.animations
        };
    }

    if (ext === "obj") {

        return {
            object: loadOBJ(data),
            animations: []
        };
    }

    if (ext === "stl") {

        return {
            object: loadSTL(data),
            animations: []
        };
    }

    throw new Error(
        `Unsupported 3D file type: .${extension}`
    );
}
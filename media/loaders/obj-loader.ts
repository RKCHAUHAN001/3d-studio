import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const loader = new OBJLoader();

export function loadOBJ(
    data: Uint8Array
): THREE.Group {

    const text =
        new TextDecoder("utf-8").decode(data);

    return loader.parse(text);
}
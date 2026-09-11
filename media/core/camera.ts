import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface CameraSystem {
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
}

export function createCamera(
    container: HTMLElement
): CameraSystem {

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;

    const camera =
        new THREE.PerspectiveCamera(
            45,
            width / height,
            0.01,
            100000
        );

    camera.position.set(
        3,
        2,
        5
    );

    const controls =
        new OrbitControls(
            camera,
            container
        );

    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;

    controls.minDistance = 0.01;
    controls.maxDistance = 100000;

    controls.target.set(
        0,
        0,
        0
    );

    return {
        camera,
        controls
    };
}
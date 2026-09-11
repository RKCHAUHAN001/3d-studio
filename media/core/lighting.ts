import * as THREE from "three";

export interface LightingSystem {
    ambient: THREE.HemisphereLight;
    key: THREE.DirectionalLight;
    fill: THREE.DirectionalLight;
    rim: THREE.DirectionalLight;
}

export function createLighting(
    scene: THREE.Scene
): LightingSystem {

    const ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x202030,
            1.8
        );

    scene.add(ambient);

    const key =
        new THREE.DirectionalLight(
            0xffffff,
            3.0
        );

    key.position.set(
        5,
        8,
        6
    );

    key.castShadow = true;

    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;

    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 100;

    key.shadow.camera.left = -20;
    key.shadow.camera.right = 20;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -20;

    key.shadow.bias = -0.0001;

    scene.add(key);

    const fill =
        new THREE.DirectionalLight(
            0x9fb8ff,
            1.5
        );

    fill.position.set(
        -5,
        4,
        3
    );

    scene.add(fill);

    const rim =
        new THREE.DirectionalLight(
            0xffffff,
            1.8
        );

    rim.position.set(
        0,
        5,
        -8
    );

    scene.add(rim);

    return {
        ambient,
        key,
        fill,
        rim
    };
}

export function setLightingIntensity(
    lighting: LightingSystem,
    intensity: number
): void {

    lighting.ambient.intensity =
        1.8 * intensity;

    lighting.key.intensity =
        3.0 * intensity;

    lighting.fill.intensity =
        1.5 * intensity;

    lighting.rim.intensity =
        1.8 * intensity;
}
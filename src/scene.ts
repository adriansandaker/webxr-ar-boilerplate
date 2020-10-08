import { Vector3, Quaternion } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { WebXRAnchorSystem, IWebXRAnchor } from "@babylonjs/core/XR/features/WebXRAnchorSystem";
import { WebXRHitTest, IWebXRHitResult } from "@babylonjs/core/XR/features/WebXRHitTest";
import { WebXRState } from "@babylonjs/core/XR/webXRTypes";
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { createXrPlaneMarker } from "./components/xrPlaneMarker";
import { createXrUI } from "./components/xrUI";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { v4 as UUID } from 'uuid';

let xrExperience: WebXRDefaultExperience;

const anchorList: IWebXRAnchor[] = [];

export const createScene = async (engine: Engine, xrCanvas: HTMLCanvasElement) => {
    const scene = new Scene(engine);

    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(xrCanvas, true);

    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

    // Reference space types described here: https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Geometry
    xrExperience = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: 'immersive-ar',
            referenceSpaceType: 'unbounded',
        },
        optionalFeatures: true,
    });

    const xrFeatureManager = xrExperience.baseExperience.featuresManager;
    const xrHitTest = xrFeatureManager.enableFeature(WebXRHitTest.Name, 'latest') as WebXRHitTest;
    const xrAnchorSystem = xrFeatureManager.enableFeature(WebXRAnchorSystem.Name, 'latest') as WebXRAnchorSystem;

    const xrPlaneMarker = createXrPlaneMarker(scene);

    const model = await SceneLoader.LoadAssetContainerAsync("./assets/models/", "crate.glb", scene);
    const modelMesh = model.meshes[0];
    modelMesh.rotationQuaternion = new Quaternion();

    // Meep the latest hit test result here.
    let xrHitTestResult: IWebXRHitResult | undefined;

    xrHitTest.onHitTestResultObservable.add(async results => {
        if (results.length) {
            xrPlaneMarker.isVisible = true;
            xrHitTestResult = results[0];
            if (xrPlaneMarker.rotationQuaternion) {
                xrHitTestResult.transformationMatrix.decompose(undefined, xrPlaneMarker.rotationQuaternion, xrPlaneMarker.position);
            }
        } else {
            xrPlaneMarker.isVisible = false;
            xrHitTestResult = undefined;
        }
    });

    if (xrAnchorSystem) {
        xrAnchorSystem.onAnchorAddedObservable.add(anchor => {
            if (modelMesh) {
                const foxId = UUID();
                modelMesh.isVisible = true;
                anchor.attachedNode = modelMesh.clone(foxId, null, false) as TransformNode;
                modelMesh.isVisible = false;
                anchorList.push(anchor);
            }
        });

        xrAnchorSystem.onAnchorRemovedObservable.add(anchor => {
            if (anchor && anchor.attachedNode) {
                anchor.attachedNode.dispose();
            }
        })
    }

    scene.onPointerObservable.add(async (pointerEvent) => {
        if (xrAnchorSystem && xrHitTestResult && xrExperience.baseExperience.state === WebXRState.IN_XR) {
            const anchor = xrAnchorSystem.addAnchorPointUsingHitTestResultAsync(xrHitTestResult);
        }
    }, PointerEventTypes.POINTERDOWN);

    scene.onPointerObservable.add(async (pointerEvent) => { }, PointerEventTypes.POINTERUP);

    // Setup XR user interface.
    createXrUI(scene, xrExperience, anchorList);

    return scene;
};
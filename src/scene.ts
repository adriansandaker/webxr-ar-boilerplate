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
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { v4 as UUID } from 'uuid';
import { createPlaneMarker } from "./components/PlaneMarker";
import { create3DGUI } from "./components/UIPanel";

export const createScene = async (engine: Engine, xrCanvas: HTMLCanvasElement) => {
  const anchors: IWebXRAnchor[] = [];

  const scene = new Scene(engine);

  const model = await SceneLoader.LoadAssetContainerAsync("./assets/models/", "crate.glb", scene);
  
  const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  
  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(xrCanvas, true);


  const xrExperience: WebXRDefaultExperience =
    await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: 'immersive-ar',
        referenceSpaceType: 'unbounded',
      },
      optionalFeatures: true,
    });

  const xrFeatureManager = xrExperience.baseExperience.featuresManager;
  const xrHitTest = xrFeatureManager.enableFeature(WebXRHitTest.Name, 'latest') as WebXRHitTest;
  const xrAnchorSystem = xrFeatureManager.enableFeature(WebXRAnchorSystem.Name, 'latest') as WebXRAnchorSystem;

  const xrPlaneMarker = createPlaneMarker(scene);

  const modelMesh = model.meshes[0];
  modelMesh.rotationQuaternion = new Quaternion();

  // Store the latest hit test result here.
  let xrHitTestResult: IWebXRHitResult | undefined;

   // Listener for touch input events from canvas.
  scene.onPointerObservable.add(async (pointerEvent) => {
    if (xrAnchorSystem && xrHitTestResult && xrExperience.baseExperience.state === WebXRState.IN_XR) {
      const anchor = xrAnchorSystem.addAnchorPointUsingHitTestResultAsync(xrHitTestResult);
    }
  }, PointerEventTypes.POINTERDOWN);

  // Called on every hit test.
  xrHitTest.onHitTestResultObservable.add(async results => {
    if (results.length) {
      xrPlaneMarker.isVisible = true;
      xrHitTestResult = results[0];

      // Update plane marker location to reflect latest hit test.
      if (xrPlaneMarker.rotationQuaternion) {
        xrHitTestResult.transformationMatrix.decompose(undefined, xrPlaneMarker.rotationQuaternion, xrPlaneMarker.position);
      }
    } else {
      xrPlaneMarker.isVisible = false;
      xrHitTestResult = undefined;
    }
  });

  if (xrAnchorSystem) {
    // Called when a new anchor is added to the scene.
    xrAnchorSystem.onAnchorAddedObservable.add(anchor => {
      if (modelMesh) {
        modelMesh.isVisible = true;
        anchor.attachedNode = modelMesh.clone(UUID(), null, false) as TransformNode;
        modelMesh.isVisible = false;
        anchors.push(anchor);
      }
    });

    // Called when an anchor is removed from the scene.
    xrAnchorSystem.onAnchorRemovedObservable.add(anchor => {
      if (anchor && anchor.attachedNode) {
        anchor.attachedNode.dispose();
      }
    })
  }

  // Setup XR user interface.
  create3DGUI(scene, xrExperience, anchors);

  return scene;
};

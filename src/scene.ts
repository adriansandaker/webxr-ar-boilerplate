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

/*  This is where the magic happens. The create scene function is where we set up all
 *  the essential parts of our immersive AR experience. 
 */
export const createScene = async (engine: Engine, xrCanvas: HTMLCanvasElement) => {
  // Simple array to store our anchors.
  const anchors: IWebXRAnchor[] = [];

  const scene = new Scene(engine);

<<<<<<< HEAD
  const model = await SceneLoader.LoadAssetContainerAsync("./assets/models/", "crate.glb", scene);

||||||| merged common ancestors
  const model = await SceneLoader.LoadAssetContainerAsync("./assets/models/", "crate.glb", scene);
  
=======
  // Load our model.
  const model = await SceneLoader.LoadAssetContainerAsync("./assets/models/", "koala.glb", scene);
  
>>>>>>> 1b63d81f7f8ae0528f24ff4fb8f8be9796c805c0
  const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(xrCanvas, true);

<<<<<<< HEAD
  // Initialize the XR experience using the BabylonJS
  // helper method.
||||||| merged common ancestors

=======
  /* Setup the base WebXR experience using a helper function from
   * the BabylonJS library. This function initializes an XR scene,
   * creates an XR camera, and initializes a feature manager.
   * 
   * https://doc.babylonjs.com/how_to/webxr_experience_helpers
   */
>>>>>>> 1b63d81f7f8ae0528f24ff4fb8f8be9796c805c0
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

  // Create the marker used to indicate scanned planes.
  const xrPlaneMarker = createPlaneMarker(scene);

  // Get the mesh from our model.
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

  /*  Called on every hit test. If a hit test is found, we show our circular marker
   *  on the surface and store the result for later use. 
   */
  xrHitTest.onHitTestResultObservable.add(async results => {
    if (results.length) {
      xrPlaneMarker.isVisible = true;
      xrHitTestResult = results[0];

      // Update plane marker location in AR space to reflect latest hit test.
      if (xrPlaneMarker.rotationQuaternion) {
        xrHitTestResult.transformationMatrix.decompose(undefined, xrPlaneMarker.rotationQuaternion, xrPlaneMarker.position);
      }
    } else {
      xrPlaneMarker.isVisible = false;
      xrHitTestResult = undefined;
    }
  });

<<<<<<< HEAD
  // Ensure the WebXR anchor system is setup before attempting to add anchor.
||||||| merged common ancestors
=======
  // Ensure our anchor system exists before attempting to add an anchor.
>>>>>>> 1b63d81f7f8ae0528f24ff4fb8f8be9796c805c0
  if (xrAnchorSystem) {
    // Called when a new anchor is added to the scene.
    xrAnchorSystem.onAnchorAddedObservable.add(anchor => {
      // If our mesh has been initialized, clone the mesh and add it to the anchor.
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

  // Setup a simple XR user interface.
  create3DGUI(scene, xrExperience, anchors);

  return scene;
};

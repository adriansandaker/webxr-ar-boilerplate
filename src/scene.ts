import { Vector3, Quaternion } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { WebXRState } from "@babylonjs/core/XR/webXRTypes";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { v4 as UUID } from "uuid";
import { createPlaneMarker } from "./components/PlaneMarker";
import { create3DGUI } from "./components/UIPanel";
import { displayScanEnvironmentPrompt } from "./components/ScanPrompt";
import {
  WebXRAnchorSystem,
  IWebXRAnchor,
} from "@babylonjs/core/XR/features/WebXRAnchorSystem";
import {
  WebXRHitTest,
  IWebXRHitResult,
} from "@babylonjs/core/XR/features/WebXRHitTest";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";

/*  This is where the magic happens. The create scene function is where we set up all
 *  the essential parts of our immersive AR experience.
 */
export const createScene = async (engine: Engine) => {
  // Simple array to store our anchors.
  const anchors: IWebXRAnchor[] = [];

  const scene = new Scene(engine);

  // Load our model.
  const model = await SceneLoader.LoadAssetContainerAsync(
    "./assets/models/",
    "koala.glb",
    scene
  );

  const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(true);

  /* Setup the base WebXR experience using a helper function from
   * the BabylonJS library. This function initializes an XR scene,
   * creates an XR camera, and initializes a feature manager.
   *
   * https://doc.babylonjs.com/how_to/webxr_experience_helpers
   */
  const xrExperience: WebXRDefaultExperience = await scene.createDefaultXRExperienceAsync(
    {
      uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "unbounded",
      },
      optionalFeatures: true,
    }
  );

  const xrFeatureManager = xrExperience.baseExperience.featuresManager;
  const xrHitTest = xrFeatureManager.enableFeature(
    WebXRHitTest.Name,
    "latest"
  ) as WebXRHitTest;
  const xrAnchorSystem = xrFeatureManager.enableFeature(
    WebXRAnchorSystem.Name,
    "latest"
  ) as WebXRAnchorSystem;

  // Create the marker used to indicate scanned planes.
  const xrPlaneMarker = createPlaneMarker(scene);

  // Get the mesh from our model.
  const modelMesh = model.meshes[0];
  modelMesh.rotationQuaternion = new Quaternion();

  // Store the latest hit test result here.
  let xrHitTestResult: IWebXRHitResult | undefined;

  // Display a message in the UI prompting the user to scan the environment.
  // To clear, call the .dispose() method.
  const scanPrompt = await displayScanEnvironmentPrompt();

  // Listener for touch input events from canvas.
  scene.onPointerObservable.add(async (pointerEvent) => {
    if (
      xrAnchorSystem &&
      xrHitTestResult &&
      xrExperience.baseExperience.state === WebXRState.IN_XR
    ) {
      xrAnchorSystem.addAnchorPointUsingHitTestResultAsync(
        xrHitTestResult
      );
    }
  }, PointerEventTypes.POINTERDOWN);

  /*  Called on every hit test. If a hit test is found, we show our circular marker
   *  on the surface and store the result for later use.
   */
  xrHitTest.onHitTestResultObservable.add(async (results) => {
    if (results.length) {
      xrPlaneMarker.isVisible = true;
      xrHitTestResult = results[0];
      
      // Remove environment scan prompt.
      if (scanPrompt) {
        scanPrompt.dispose();
      };

      // Update plane marker location in AR space to reflect latest hit test.
      if (xrPlaneMarker.rotationQuaternion) {
        xrHitTestResult.transformationMatrix.decompose(
          undefined,
          xrPlaneMarker.rotationQuaternion,
          xrPlaneMarker.position
        );
      }
    } else {
      xrPlaneMarker.isVisible = false;
      xrHitTestResult = undefined;
    }
  });

  // Ensure our anchor system exists before attempting to add an anchor.
  if (xrAnchorSystem) {
    // Called when a new anchor is added to the scene.
    xrAnchorSystem.onAnchorAddedObservable.add((anchor) => {
      // If our mesh has been initialized, clone the mesh and add it to the anchor.
      if (modelMesh) {
        modelMesh.isVisible = true;
        anchor.attachedNode = modelMesh.clone(
          UUID(),
          null,
          false
        ) as TransformNode;
        modelMesh.isVisible = false;
        anchors.push(anchor);
      }
    });

    // Called when an anchor is removed from the scene.
    xrAnchorSystem.onAnchorRemovedObservable.add((anchor) => {
      if (anchor && anchor.attachedNode) {
        anchor.attachedNode.dispose();
      }
    });
  }

  // Setup a simple XR user interface.
  create3DGUI(scene, xrExperience, anchors);

  
  return scene;
};

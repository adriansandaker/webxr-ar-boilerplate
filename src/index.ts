import xrUtils from './utils/xrUtils';
import { v4 as UUID } from 'uuid';
// Loaders, helper and and required side-effects
import "@babylonjs/loaders/glTF/2.0";
import "@babylonjs/core/Cameras/universalCamera";
import '@babylonjs/core/Helpers/sceneHelpers';
// GUI
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { StackPanel3D } from "@babylonjs/gui/3D/controls/stackPanel3D";
import { Button3D } from "@babylonjs/gui/3D/controls/button3D";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
// Core
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Quaternion } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { WebXRAnchorSystem, IWebXRAnchor } from "@babylonjs/core/XR/features/WebXRAnchorSystem";
import { WebXRHitTest, IWebXRHitResult } from "@babylonjs/core/XR/features/WebXRHitTest";
import { WebXRState } from "@babylonjs/core/XR/webXRTypes";
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

const appRoot: HTMLElement | null = document.getElementById('app-root');

let engine: Engine;
let scene: Scene;
let xrCanvas: HTMLCanvasElement;
let xrExperience: WebXRDefaultExperience;

const anchors: IWebXRAnchor[] = [];

const setupXrUI = async (scene: Scene) => {

  const guiManager = new GUI3DManager(scene);
  const panel = new StackPanel3D();
  guiManager.addControl(panel);

  // Position the panel in front of the camera.
  panel.position = new Vector3(0, 0, 5);

  const clearButton = new Button3D("clearButton");
  const clearButtonText = new TextBlock("clearButtonText");;
  clearButtonText.text = "Clear"
  clearButtonText.color = "white";
  clearButtonText.fontSize = 32;
  clearButton.content = clearButtonText;

  const exitArButton = new Button3D("exitButton");
  const exitArButtonText = new TextBlock("exitArText");
  exitArButtonText.text = "Exit AR";
  exitArButtonText.color = "white";
  exitArButtonText.fontSize = 32;
  exitArButton.content = exitArButtonText;

  panel.margin = 0.2;

  panel.addControl(clearButton);
  panel.addControl(exitArButton);


  if (clearButton.mesh && clearButton.mesh.material) {
    clearButton.mesh.material.alpha = 0.9;
  }
  if (exitArButton.mesh && exitArButton.mesh.material) {
    exitArButton.mesh.material.alpha = 0.9;
  }

  clearButton.onPointerClickObservable.add(() => {
    if (anchors.length) {
      anchors.forEach((anchor: IWebXRAnchor) => {
        if (anchor.attachedNode !== undefined) {
          anchor.attachedNode.isEnabled(false);
          anchor.attachedNode.dispose();
        }
      })
    }
  });

  exitArButton.onPointerClickObservable.add(async () => {
    await xrExperience.baseExperience.exitXRAsync();
  });
}

const createScene = async () => {
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

  const xrPlaneMarker = MeshBuilder.CreateDisc("xrPlaneMarker", { radius: 0.07, tessellation: 16 }, scene);
  xrPlaneMarker.isVisible = false;
  xrPlaneMarker.rotationQuaternion = new Quaternion();

  const xrPlaneMarkerMaterial = new StandardMaterial("xrPlaneMarkerMaterial", scene);
  xrPlaneMarkerMaterial.diffuseColor = new Color3(1, 0, 1);
  xrPlaneMarkerMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
  xrPlaneMarkerMaterial.emissiveColor = new Color3(1, 1, 1);
  xrPlaneMarkerMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);
  xrPlaneMarkerMaterial.alpha = 0.5;
  xrPlaneMarker.material = xrPlaneMarkerMaterial;

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
        anchors.push(anchor);
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
  setupXrUI(scene);

  return scene;
};

const initializeXr = async () => {

  if (!xrCanvas && appRoot) {
    xrCanvas = document.createElement('canvas');
    appRoot.appendChild(xrCanvas);
  }

  engine = new Engine(xrCanvas, true);

  scene = await createScene();

  engine.runRenderLoop(function () {
    scene.render();
  });
}

async function init() {
  const isImmersiveArSupported = await xrUtils.browserHasImmersiveArCompatibility();

  if (isImmersiveArSupported) {
    initializeXr();
  } else {
    xrUtils.displayUnsupportedBrowserMessage();
  }

};

window.onload = () => init();
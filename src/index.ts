import xrUtils from './utils/xrUtils';
// Loaders, helper and and required side-effects
import "./utils/xrHelpers";
// Core
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { createScene } from "./scene";

const appRoot: HTMLElement | null = document.getElementById('app-root');

let engine: Engine;
let scene: Scene;
let xrCanvas: HTMLCanvasElement;

// Create canvas and setup BabylonJS scene.
const initializeXr = async () => {

  if (!xrCanvas && appRoot) {
    xrCanvas = document.createElement('canvas');
    appRoot.appendChild(xrCanvas);
  }

  engine = new Engine(xrCanvas, true);

  scene = await createScene(engine, xrCanvas);

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

init();
import xrUtils from './utils/xrUtils';
// Loaders, helper and and required side-effects
import "./utils/xrHelpers";
// Core
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { createScene } from "./scene";

const initializeXrApp = async () => {
  
  let xrCanvas: HTMLCanvasElement = document.createElement('canvas');;
  const appRoot: HTMLElement | null = document.getElementById('app-root');

  if (appRoot) {
    appRoot.appendChild(xrCanvas);
  }

  const engine: Engine = new Engine(xrCanvas, true);

  const scene: Scene = await createScene(engine, xrCanvas);

  engine.runRenderLoop(function () {
    scene.render();
  });
}

async function start() {
  const isImmersiveArSupported = await xrUtils.browserHasImmersiveArCompatibility();

  if (isImmersiveArSupported) {
    initializeXrApp();
  } else {
    xrUtils.displayUnsupportedBrowserMessage();
  }

};

start();

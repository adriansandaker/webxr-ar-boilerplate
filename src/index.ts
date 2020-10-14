import xrUtils from './utils/xrUtils';
// Loaders, helper and and required side-effects
import "./utils/xrHelpers";
// Core
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { createScene } from "./scene";

/*  This function sets up all the parts we need to run our WebXR experience. 
 *  A canvas-element is created and passed to the BabylonJS engine, before we call the
 *  createScene function from our Scene-file to set up our BabylonJS Scene.
 *  Finally, we run the main render loop which will continue running until
 *  the app is terminated.
 */
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

/*  This function checks for WebXR 'immersive-ar' support in users browser, and will
 *  initialize the application if 'immersive-ar' support is found.
 *  If no support is found, a message is displayed prompting the user to use a 
 *  recent version of Chrome on Android.
 */
async function start() {
  const isImmersiveArSupported = await xrUtils.browserHasImmersiveArCompatibility();

  if (isImmersiveArSupported) {
    initializeXrApp();
  } else {
    xrUtils.displayUnsupportedBrowserMessage();
  }

};

start();

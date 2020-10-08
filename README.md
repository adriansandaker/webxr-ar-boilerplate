# WebXR Augmented Reality Boilerplate ✨

This project is a simple boilerplate that starts a WebXR session with BabylonJS and enables user to display some content in the AR space. 

Implementation aims to use the most recent versions of BabylonJS, and APIs used might evolve over time. Beware of things breaking!

**IMPORTANT: The app requires a browser capable of using WebXR with experimental features such as WebXRAnchors and WebXRHitTest. Currently the most suitable browser is [Google Chrome Beta on Android](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en), which seems to be furthest along in implementing the WebXR spec. Hopefully we will soon see support in both Chrome stable, Firefox and Safari.**

### Running the app

To get up and running clone the repo and run the following commands to install dependencies and start the app:

    yarn
    yarn start

This will start an instance of webpack-dev-server on port 8080. To access the app on a compatible device/browser you have to serve it over HTTPS, otherwise BabylonJS will fail to setup the WebXR components properly. For development. I suggest using an [ngrok](https://ngrok.com/)-tunnel to get up an running fast. A configuration has been provided (ngrok.yml) to ease the setup and configuration time.

### Debugging

As the app is running on a mobile device, you won't be able to access the devtools directly in the mobile browser. For development and debugging, attach the device to your machine using a cable and access the url `chrome://inspect/#devices` in your desktop version of Chrome. Allow debug access when prompted on your device. You should then be able to see your device appear in the inspection window you opened earlier, where you can use the `inspect` functionality to get access to the running app instance for debugging.

### BabylonJS Notes

Project uses the ES6 packages for BabylonJS. Correct usage is documented in the official docs [here](https://doc.babylonjs.com/features/es6_support). These split the various modules into different packages. 

When bumping versions, ensure you update all packages within the @babylonjs namespace to avoid version mismatches.

*Grass model used in app created by [Poly by Google](https://poly.google.com/view/3tyh15Fbmsx).*
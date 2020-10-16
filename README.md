# WebXR Augmented Reality Boilerplate ✨

This project is a simple boilerplate that starts a WebXR session with BabylonJS and enables user to display some content in the AR space. 

**IMPORTANT: The app requires a browser capable of using WebXR with experimental WebXR features such as WebXRAnchors and WebXRHitTest. Currently the most suitable browser is [Google Chrome Beta on Android](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en), which seems to be furthest along in implementing the latest parts of the WebXR spec. Chrome Stable on Android is also a well suited. Sadly, iOS is currently not supported. Hopefully we will soon see support in both Firefox and Safari.**

### Running the app

To get up and running clone the repo and run the following commands to install dependencies and start the app:

    yarn
    yarn start

This will start an instance of webpack-dev-server on port 8080. To access the app on a compatible device/browser you have to serve it over HTTPS, otherwise BabylonJS will fail to setup the WebXR components properly. 

### Serving over HTTPS

WebXR requires HTTPS to run. To get the app running for local development, you could either generate certificates for use with [webpack-dev-server](https://webpack.js.org/configuration/dev-server/#devserverhttps) or use a HTTPS-compatible tunneling service like [ngrok](https://ngrok.com/) to expose localhost to the web.

If you are using ngrok, a helper script is available to create a new ngrok instance on start.
To run the app and setup an ngrok tunnel, simply run: 

    yarn start:live

This will start webpack-dev-server, and start a new instance of ngrok to access your application. The URL will be printed in the console, just look for the rocketship-emoji!

### Debugging

As the app is running on a mobile device, you won't be able to access the devtools directly in the mobile browser. For development and debugging, attach the device to your machine using a cable and access the url `chrome://inspect/#devices` in your desktop version of Chrome. Allow debug access when prompted on your device. You should then be able to see your device appear in the inspection window you opened earlier, where you can use the `inspect` functionality to get access to the running app instance for debugging.

*instructions for WiFi debugging coming soon*

### BabylonJS Notes

Implementation aims to always use the most recent versions of BabylonJS, and the WebXR APIs could evolve and change as the standard is developed. Beware of things breaking!

Project uses the ES6 packages for BabylonJS. Correct usage is documented in the official docs [here](https://doc.babylonjs.com/features/es6_support). These split the various modules into different packages. 

When bumping versions, ensure you update all packages within the @babylonjs namespace to avoid version mismatches.


### Credits

Thanks to [*Poly by Google*](https://poly.google.com/view/fzCu8FM0HfB) for the Koala model.
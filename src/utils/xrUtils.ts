export interface XRUtils {
  browserHasImmersiveArCompatibility: () => Promise<boolean>;
  displayUnsupportedBrowserMessage: () => void;
}

/*  Returns true if navigator has xr with 'immersive-ar' capabilities
 *  Returns false otherwise.
 */
export async function browserHasImmersiveArCompatibility(): Promise<boolean> {
  if (window.navigator.xr) {
    const isSupported: boolean = await navigator.xr.isSessionSupported(
      "immersive-ar"
    );
    console.info(
      `[DEBUG] ${
        isSupported
          ? "Browser supports immersive-ar"
          : "Browser does not support immersive-ar"
      }`
    );
    return isSupported;
  }
  return false;
}

/* Message to display when no XR capabilities found */
export function displayUnsupportedBrowserMessage(): void {
  const appRoot: HTMLElement | null = document.getElementById("app-root");
  const bigMessage: HTMLParagraphElement = document.createElement("p");
  bigMessage.innerText = "😢 Oh no!";
  bigMessage.className = "ui__message-big";
  if (appRoot) {
    appRoot.appendChild(bigMessage);
  }

  const middleMessage: HTMLParagraphElement = document.createElement("p");
  middleMessage.innerText =
    "Your browser does not support augmented reality with WebXR.";
  middleMessage.className = "ui__message-med";

  if (appRoot) {
    appRoot.appendChild(middleMessage);
  }

  const helpMessage: HTMLParagraphElement = document.createElement("p");
  helpMessage.innerText =
    "Try again using a recent version of Chrome on Android.";
  helpMessage.className = "ui__message-med";

  if (appRoot) {
    appRoot.appendChild(helpMessage);
  }
}

export default {
  browserHasImmersiveArCompatibility,
  displayUnsupportedBrowserMessage,
} as XRUtils;

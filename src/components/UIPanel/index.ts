import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { StackPanel3D } from "@babylonjs/gui/3D/controls/stackPanel3D";
import { Button3D } from "@babylonjs/gui/3D/controls/button3D";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { IWebXRAnchor } from "@babylonjs/core/XR/features/WebXRAnchorSystem";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";

/*
 *  Create a simple UI in AR with buttons to exit AR
 *  and clear anchors.
 */
export const create3DGUI = async (
  scene: Scene,
  xrExperience: WebXRDefaultExperience,
  anchorList: IWebXRAnchor[]
) => {
  const guiManager = new GUI3DManager(scene);
  const panel = new StackPanel3D();
  guiManager.addControl(panel);

  // Position the UI panel in front of the camera.
  panel.position = new Vector3(0, 0, 5);

  const clearButton = new Button3D("clearButton");
  const clearButtonText = new TextBlock("clearButtonText");
  clearButtonText.text = "Clear";
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

  // Make buttons slightly transparent.
  if (clearButton.mesh && clearButton.mesh.material) {
    clearButton.mesh.material.alpha = 0.9;
  }
  if (exitArButton.mesh && exitArButton.mesh.material) {
    exitArButton.mesh.material.alpha = 0.9;
  }

  // Click listener for clear button.
  clearButton.onPointerClickObservable.add(() => {
    if (anchorList.length) {
      anchorList.forEach((anchor: IWebXRAnchor) => {
        if (anchor.attachedNode !== undefined) {
          anchor.attachedNode.isEnabled(false);
          anchor.attachedNode.dispose();
        }
      });
    }
  });

  // Click listener for exit button.
  exitArButton.onPointerClickObservable.add(async () => {
    await xrExperience.baseExperience.exitXRAsync();
  });
};

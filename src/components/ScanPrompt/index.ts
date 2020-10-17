import { TextBlock, TextWrapping } from "@babylonjs/gui/2D/controls/textBlock";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";

/** Display a message prompting the user to scan the environment in order
 *  to detect planes. Call .dispose() on the returned object to clear message.
 */
export const displayScanEnvironmentPrompt = async () => {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const helperMessage = new TextBlock();
  helperMessage.text = "Move your device in a circular motion to scan the environment around you.";
  helperMessage.color = "white";
  helperMessage.fontSize = 48;
  helperMessage.textWrapping = TextWrapping.WordWrap;
  helperMessage.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  helperMessage.paddingBottom = "10%";
  advancedTexture.addControl(helperMessage);

  return advancedTexture;
};

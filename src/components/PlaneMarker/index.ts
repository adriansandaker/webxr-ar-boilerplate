import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Quaternion } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";

/*
 *  Creates a simple circular marker mesh to overlay on scanned planes.
 */
export const createPlaneMarker = (scene: Scene) => {
  const xrPlaneMarker = MeshBuilder.CreateDisc(
    "xrPlaneMarker",
    { radius: 0.07, tessellation: 16 },
    scene
  );
  xrPlaneMarker.isVisible = false;
  xrPlaneMarker.rotationQuaternion = new Quaternion();

  const xrPlaneMarkerMaterial = new StandardMaterial(
    "xrPlaneMarkerMaterial",
    scene
  );
  xrPlaneMarkerMaterial.diffuseColor = new Color3(1, 0, 1);
  xrPlaneMarkerMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
  xrPlaneMarkerMaterial.emissiveColor = new Color3(1, 1, 1);
  xrPlaneMarkerMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);
  xrPlaneMarkerMaterial.alpha = 0.5;
  xrPlaneMarker.material = xrPlaneMarkerMaterial;

  return xrPlaneMarker;
};

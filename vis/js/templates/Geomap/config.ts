import { Config } from "./types";

export const CONFIG: Config = {
  MAP: {
    center: [45.1, 4.1],
    zoom: 4,
    maxZoom: 17,
    minZoom: 2,
    maxBounds: [
      [-85, -180],
      [85, 180],
    ],
    maxBoundsViscosity: 1.0,
    worldCopyJump: true,
    keyboard: false,
    zoomControl: false,
  },
  ZOOM_CONTROL: {
    position: "bottomright",
  },
};

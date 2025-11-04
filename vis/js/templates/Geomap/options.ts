import { Options } from "./types";

export const OPTIONS: Options = {
  MAP: {
    center: [45.1, 4.1],
    zoom: 4,
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
  LAYER: {
    attribution: "&copy; OpenStreetMap contributors",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  ZOOM_CONTROL: {
    position: "bottomright",
  },
};

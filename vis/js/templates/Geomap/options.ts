import { Options } from "./types";

export const OPTIONS: Options = {
  map: {
    center: [48.216651235748074, 16.39589688527869],
    zoom: 4,
    minZoom: 2,
    maxBounds: [
      [-85, -180],
      [85, 180],
    ],
    maxBoundsViscosity: 1.0,
    worldCopyJump: true,
  },
  tileLayer: {
    attribution: "&copy; OpenStreetMap contributors",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
};

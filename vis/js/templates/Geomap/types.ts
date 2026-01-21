import { MapOptions } from "leaflet";

export type Config = Required<
  Pick<
    MapOptions,
    | "center"
    | "zoom"
    | "minZoom"
    | "maxZoom"
    | "maxBounds"
    | "maxBoundsViscosity"
    | "worldCopyJump"
    | "keyboard"
    | "zoomControl"
  >
>;
